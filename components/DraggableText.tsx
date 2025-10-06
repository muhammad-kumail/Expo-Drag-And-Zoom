import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  LayoutRectangle,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  clamp,
} from "react-native-reanimated";

interface DraggableTextProps {
  text: string;
  backgroundColor?: string;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  onLayout?: (e: LayoutRectangle | undefined) => void;
  onChangeText?: (e: string) => void;
}

const DraggableText: React.FC<DraggableTextProps> = ({
  text,
  backgroundColor = "transparent",
  textStyle,
  style,
  onLayout,
  onChangeText,
}) => {
  // canvas size measured dynamically
  const [canvas, setCanvas] = useState({
    width: Dimensions.get("window").width,
    height: 500,
  });
  const [textSize, setTextSize] = useState({ width: 0, height: 0 });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);

  const isDragging = useSharedValue(false);
  const isScaling = useSharedValue(false);
  const isMeasured = useSharedValue(false);
  const baseFontSize = 22;

  // --- Pan gesture (drag)
  const panGesture = Gesture.Pan()
    .onTouchesDown(() => {
      isDragging.value = true;
    })
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const newX = startX.value + e.translationX;
      const newY = startY.value + e.translationY;

      const minX = 0;
      const minY = 0;
      const maxX = canvas.width - textSize.width;
      const maxY = canvas.height - textSize.height;

      translateX.value = clamp(newX, minX, maxX);
      translateY.value = clamp(newY, minY, maxY);
    })
    .onEnd(() => {
      translateX.value = withSpring(translateX.value);
      translateY.value = withSpring(translateY.value);
      isDragging.value = false;
    })
    .onFinalize(() => {
      isDragging.value = false;
    });

  // --- Pinch gesture (scale)
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      isScaling.value = true;
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = clamp(startScale.value * e.scale, 0.5, 3);
    })
    .onEnd(() => {
      scale.value = withSpring(scale.value);
      isScaling.value = false;
    });

  // --- Combine gestures
  const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // --- Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    borderColor: isDragging.value || isScaling.value ? "#fff" : "transparent",
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    fontSize: baseFontSize * scale.value,
  }));

  // --- Center text when first measured
  useEffect(() => {
    if (
      !isMeasured.value &&
      canvas.height &&
      canvas.width &&
      textSize.height &&
      textSize.width
    ) {
      isMeasured.value = true;
      translateX.value = (canvas.width - textSize.width) / 2;
      translateY.value = (canvas.height - textSize.height) / 2;
    }
  }, [canvas, textSize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={[styles.container]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          runOnJS(setCanvas)({ width, height });
        }}
      >
        <GestureDetector gesture={combinedGesture}>
          <Animated.View
            style={[
              styles.textContainer,
              animatedStyle,
              { backgroundColor },
              style,
            ]}
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              runOnJS(setTextSize)({
                width: layout.width,
                height: layout.height,
              });
              onLayout?.(layout);
            }}
          >
            <Animated.Text
              style={[styles.text, textStyle, animatedTextStyle]}
              onPress={() => onChangeText?.(text)}
            >
              {text}
            </Animated.Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

export default DraggableText;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    position: "absolute",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});

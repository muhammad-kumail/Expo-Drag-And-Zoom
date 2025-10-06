import DraggableText from "@/components/DraggableText";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <DraggableText
        text="Drag me & pinch to scale 👋"
        backgroundColor="rgba(255,255,255,0.1)"
        textStyle={{ color: "yellow", fontWeight: "700" }}
        style={{ borderColor: "cyan" }}
        // onChangeText={(txt) => console.log('Tapped text:', txt)}
        // onLayout={(rect) => console.log('Layout:', rect)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "green",
  },
});

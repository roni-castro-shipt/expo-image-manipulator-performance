import { useState } from "react";
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FileService from "./fileService";
import ImagePickerService, { ImageResult } from "./imageService";
import Utils from "./utils";

export default function App() {
  const [imageData, setImageData] = useState<ImageResult | null>(null);

  const handleTakePhoto = async () => {
    const result = await ImagePickerService.getFromCamera({
      compressImageMaxWidth: 1024,
      compressImageMaxHeight: 1024,
    });
    if (!result) return;
    const currentImageUri = imageData?.uri;
    if (currentImageUri) FileService.deleteFileOrDirectory(currentImageUri);
    setImageData(result);
  };

  const handleLoadPhotoFromGallery = async () => {
    const result = await ImagePickerService.getFromPhotoLibrary();
    if (!result) return;
    const currentImageUri = imageData?.uri;
    if (currentImageUri) FileService.deleteFileOrDirectory(currentImageUri);
    setImageData(result);
  };

  const totalTime =
    imageData?.compressionManipulateTime +
      imageData?.compressionSaveSyncTime +
      imageData?.imageProcessingTime || 0;

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Button title="Take photo" onPress={handleTakePhoto} />
      <Button title="Load from gallery" onPress={handleLoadPhotoFromGallery} />
      {!!imageData?.uri && (
        <Image
          style={{ width: 300, aspectRatio: 1 }}
          source={{ uri: imageData.uri }}
        />
      )}
      <View style={{ gap: 8 }}>
        {!!imageData?.imageProcessingTime && (
          <Text style={s.timeTitle}>
            Image pick/processing time:{" "}
            {Utils.formatTimeToSeconds(imageData.imageProcessingTime)}
          </Text>
        )}
        {!!imageData?.compressionManipulateTime &&
          !!imageData.compressionSaveSyncTime && (
            <Text style={s.timeTitle}>
              Total compress time:{" "}
              {Utils.formatTimeToSeconds(
                imageData.compressionManipulateTime +
                  imageData.compressionSaveSyncTime
              )}
              <Text style={s.timeSubTitle}>
                {"\n"} • ManipulateSync:{" "}
                {Utils.formatTimeToSeconds(imageData.compressionManipulateTime)}
              </Text>
              <Text style={s.timeSubTitle}>
                {"\n"} • SaveSync:{" "}
                {Utils.formatTimeToSeconds(imageData.compressionSaveSyncTime)}
              </Text>
            </Text>
          )}
        {!!totalTime && (
          <Text style={s.timeTitle}>
            Total time: {Utils.formatTimeToSeconds(totalTime)}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  timeTitle: {
    fontWeight: "bold",
  },
  timeSubTitle: {
    fontWeight: "normal",
  },
});

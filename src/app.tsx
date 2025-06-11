import { useState } from "react";
import {
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FileService from "./fileService";
import ImagePickerService, { ImageResult } from "./imageService";
import Utils from "./utils";

const screenHeight = Dimensions.get("window").height;

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
    <ScrollView contentContainerStyle={s.scrollContent}>
      <Button title="Take photo" onPress={handleTakePhoto} />
      <Button title="Load from gallery" onPress={handleLoadPhotoFromGallery} />
      <View style={[s.imageContainer, { height: screenHeight * 0.6 }]}>
        {!!imageData?.uri && (
          <Image
            source={{ uri: imageData.uri }}
            style={s.image}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={s.infoContainer}>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 48,
  },
  infoContainer: {
    gap: 8,
    marginTop: 16,
  },
  imageContainer: {
    flexGrow: 1, // let this container grow to fill space
    width: "100%", // full width
    marginVertical: 16,
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  timeTitle: {
    fontWeight: "bold",
  },
  timeSubTitle: {
    fontWeight: "normal",
  },
});

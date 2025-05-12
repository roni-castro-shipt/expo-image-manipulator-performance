import * as FileSystem from "expo-file-system";

export const deleteFileOrDirectory = async (uri) => {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: false });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  deleteFileOrDirectory,
};

import { unstable_createFileUploadHandler as createFileUploadHandler } from "@remix-run/node";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from "@remix-run/server-runtime";

export const uploadHandler = composeUploadHandlers(
  createFileUploadHandler({
    directory: "public/uploads",
    maxPartSize: 1048576,
  }),
  createMemoryUploadHandler(),
);

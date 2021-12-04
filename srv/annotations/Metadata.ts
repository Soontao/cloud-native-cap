export enum MetadataType {
  MethodBinding = "com.sap.cap.nodejs::method-binding",
  ValidBinding = "com.sap.cap.nodejs::valid-binding"
}

export interface Metadata {
  type: MetadataType;
}

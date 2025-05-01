import { useAlert, useDataMutation } from "@dhis2/app-runtime";
import { useCallback } from "react";
import i18n from "@dhis2/d2-i18n";

const documentDataQuery = {
	document: {
		resource: "documents",
		id: ({ id }: { id: string }) => `${id}/data`,
	},
};

const documentUpdateMutation = {
	type: "update",
	resource: "documents",
	id: ({ id }: { id: string }) => id,
	data: ({ data }: { data: any }) => data,
};

const documentDeleteMutation = {
	type: "delete" as const,
	resource: "documents",
	id: ({ id }: { id: string }) => id,
};

const fileResourceUpload = {
	type: "create" as const,
	resource: "fileResources",
	data: (data: { file: File }) => ({ ...data, domain: "DOCUMENT" }),
};

export interface FileUploadResponse {
	httpStatus: string;
	httpStatusCode: number;
	response: {
		responseType: "FileResource";
		fileResource: {
			id: string;
			contentType: string;
			name: string;
		};
	};
}

export interface DocumentPayload {
	external: boolean;
	attachment: boolean;
	name: string;
	type: "UPLOAD_FILE";
	url: string;
	externalAccess: boolean;
	publicAccess: string;
}

const documentCreate = {
	type: "create" as const,
	resource: "documents",
	data: ({ data }: { data: DocumentPayload }) => data,
};

export interface DocumentCreateResponse {
	response: {
		responseType: "ObjectReport";
		errorReports: Array<Record<string, unknown>>;
		uid: string;
	};
	status: string;
	httpStatusCode: number;
	httpStatus: string;
}

export function useUploadDocuments() {}

export function useManageDocument() {
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const [uploadFile] = useDataMutation(fileResourceUpload, {
		onError: (error) => {
			show({
				message: `${i18n.t("Error uploading file")}:${error.message}`,
				type: { critical: true },
			});
		},
	});
	const [createDocument] = useDataMutation(documentCreate, {
		onError: (error) => {
			show({
				message: `${i18n.t("Error uploading file")}:${error.message}`,
				type: { critical: true },
			});
		},
	});
	// @ts-expect-error app runtime errors
	const [documentDelete] = useDataMutation(documentDeleteMutation, {
		onError: (error) => {
			show({
				message: `${i18n.t("Error deleting file")}:${error.message}`,
				type: { critical: true },
			});
		},
	});

	const create = useCallback(
		async (file: File) => {
			const fileUploadResponse = (await uploadFile({
				file,
			})) as unknown as FileUploadResponse;
			const documentPayload: DocumentPayload = {
				external: false,
				attachment: true,
				name: `[public-portal] ${file.name}`,
				type: "UPLOAD_FILE",
				url: fileUploadResponse.response.fileResource.id,
				externalAccess: true,
				publicAccess: "rw------",
			};
			const documentResponse = (await createDocument({
				data: documentPayload,
			})) as unknown as DocumentCreateResponse;
			return documentResponse.response.uid;
		},
		[uploadFile, createDocument],
	);

	const deleteDocument = useCallback(
		async (id: string) => {
			await documentDelete({
				id,
			});
		},
		[documentDelete],
	);

	return {
		create,
		deleteDocument,
	};
}

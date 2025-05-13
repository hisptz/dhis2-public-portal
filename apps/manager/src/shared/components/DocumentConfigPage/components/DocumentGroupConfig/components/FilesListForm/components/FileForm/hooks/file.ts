import { useAlert, useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";

const fileUploadMutation: any = {
	resource: "fileResources",
	type: "create",
	data: (data: { file: File }) => ({ ...data, domain: "DOCUMENT" }),
};

const documentCreateMutation: any = {
	type: "create",
	resource: "documents",
	data: ({ data }: any) => data,
};

export function useUploadFile() {
	const { show, hide } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const [mutate, { loading: uploading, error }] = useDataMutation(
		fileUploadMutation,
		{
			onError: (error) => {
				show({
					message: i18n.t(
						"Could not upload file {{ errorMessage }}",
						{
							errorMessage: error.message,
						},
					),
					type: { critical: true },
				});
				setTimeout(hide, 5000);
			},
		},
	);
	const [createDocument] = useDataMutation(documentCreateMutation, {
		onError: (error) => {
			show({
				message: i18n.t(
					"Could not create document {{ errorMessage }}",
					{
						errorMessage: error.message,
					},
				),
				type: { critical: true },
			});
			setTimeout(hide, 5000);
		},
	});

	const uploadFile = async (data: {
		file: File;
		label: string;
	}): Promise<string | undefined> => {
		const uploadResponse = (await mutate(data)) as any;
		const documentPayload = {
			name: data.label,
			external: false,
			url: uploadResponse?.response?.fileResource?.id,
			type: "UPLOAD_FILE",
			attachment: true,
			externalAccess: true,
			publicAccess: "rw------",
		};
		const response = (await createDocument({
			data: documentPayload,
		})) as { response: { uid: string } };

		return response!.response!.uid;
	};

	return {
		uploading,
		uploadFile,
		error,
	};
}

const fileQuery: any = {
	file: {
		resource: "documents",
		id: ({ fileId }: { fileId: string }) => fileId,
	},
};

type QueryResponse = {
	document: {
		name: string;
		lastUpdated: string;
		displayName: string;
		id: string;
	};
};

export class CustomFile extends File {
	id: string | undefined;

	constructor({
		name,
		id,
		lastUpdated,
	}: {
		id: string;
		name: string;
		lastUpdated: string;
	}) {
		super([], name, {
			lastModified: new Date(lastUpdated).getMilliseconds(),
		});
		this.id = id;
	}
}

export function useGetFile() {
	const { refetch } = useDataQuery<QueryResponse>(fileQuery, {
		lazy: true,
	});

	const getFile = async (fileId: string) => {
		const file = (await refetch({ fileId })) as QueryResponse;
		return new CustomFile(file.document);
	};

	return {
		getFile,
	};
}

const documentDeleteMutation: any = {
	type: "delete",
	resource: "documents",
	id: ({ fileId }: { fileId: string }) => fileId,
};

export function useDeleteDocument() {
	const { show, hide } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const [deleteDocument] = useDataMutation(documentDeleteMutation, {
		onError: (error) => {
			show({
				message: i18n.t("Could not delete file {{ errorMessage }}", {
					errorMessage: error.message,
				}),
				type: { critical: true },
			});
			setTimeout(hide, 5000);
		},
	});

	const deleteFile = async (fileId: string) => {
		await deleteDocument({ fileId });
	};

	return {
		deleteFile,
	};
}

export function useDeleteDocuments() {
	const { show, hide } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const [deleteDocument] = useDataMutation(documentDeleteMutation, {
		onError: (error) => {
			show({
				message: i18n.t("Could not delete file {{ errorMessage }}", {
					errorMessage: error.message,
				}),
				type: { critical: true },
			});
			setTimeout(hide, 5000);
		},
	});

	const deleteFiles = async (fileIds: string[]) => {
		return await Promise.all(
			fileIds.map((fileId) => deleteDocument({ fileId })),
		);
	};

	return {
		deleteFiles,
	};
}

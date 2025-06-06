export type ConnectionErrorStatus = {
	status: "ERROR";
	title: string;
	message: string;
};

export type ConnectionSuccessStatus = {
	status: "OK";
	name: string;
	version: string;
};

export type ConnectionStatus = ConnectionErrorStatus | ConnectionSuccessStatus;

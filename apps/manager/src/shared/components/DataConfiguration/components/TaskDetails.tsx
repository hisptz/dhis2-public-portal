import {
	DownloadTaskDetails,
	DownloadTaskDetailsData,
} from "@/shared/components/DataConfiguration/components/DownloadTaskDetails";
import {
	UploadTaskDetails,
	UploadTaskDetailsData,
} from "@/shared/components/DataConfiguration/components/UploadTaskDetails";
import {
	Button,
	IconInfo16,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useBoolean } from "usehooks-ts";

function TaskDetailsModal({
	task,
	type,
	open,
	onClose,
}: {
	task: DownloadTaskDetailsData | UploadTaskDetailsData;
	type: "download" | "upload";
	open: boolean;
	onClose: () => void;
}) {
	return (
		<Modal position="middle" hide={!open} onClose={onClose}>
			<ModalTitle>{i18n.t("Task details")}</ModalTitle>
			<ModalContent>
				{type === "download" && <DownloadTaskDetails task={task} />}
				{type === "upload" && <UploadTaskDetails task={task} />}
			</ModalContent>
			<ModalActions>
				<Button onClick={onClose}>{i18n.t("Dismiss")}</Button>
			</ModalActions>
		</Modal>
	);
}

export function TaskDetails({
	task,
	type,
}: {
	task: DownloadTaskDetailsData | UploadTaskDetailsData;
	type: "download" | "upload";
}) {
	const { value: open, toggle } = useBoolean(false);

	return (
		<>
			<Button onClick={toggle} small icon={<IconInfo16 />} />
			{open && (
				<TaskDetailsModal
					task={task}
					type={type}
					open={open}
					onClose={toggle}
				/>
			)}
		</>
	);
}

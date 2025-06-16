import React, { useEffect, useState } from "react";
import { Box, Button, Loader, Modal, Text, Title } from "@mantine/core";
import { OrgUnitSelector } from "@hisptz/dhis2-ui";
import { OrganisationUnit, OrgUnitSelection } from "@hisptz/dhis2-utils";
import i18n from "@dhis2/d2-i18n";
import { useOrgUnit } from "@/utils/orgUnits";
import { isEmpty } from "lodash";

export function CustomOrgUnitModal({
	orgUnitState,
	open,
	onReset,
	handleClose,
	title,
	orgUnitsId,
	limitSelectionToLevels,
	onUpdate,
}: {
	orgUnitState?: string[];
	open: boolean;
	onReset: () => void;
	handleClose: () => void;
	title: string;
	orgUnitsId?: string[];
	limitSelectionToLevels?: number[];
	onUpdate: (val: string[] | undefined) => void;
}) {
	const { orgUnit: defaultOrgUnits, loading: orgUnitLoading } = useOrgUnit(
		orgUnitState ?? orgUnitsId,
	);

	const [selectedOrgUnits, setOrgUnits] = useState<
		OrganisationUnit[] | undefined
	>(defaultOrgUnits);

	useEffect(() => {
		setOrgUnits(defaultOrgUnits);
	}, [defaultOrgUnits]);

	const orgUnits = selectedOrgUnits?.map(({ id }) => id);

	return (
		<Modal
			title={
				<Text fw={"bold"} id="modal-title">
					{title}
				</Text>
			}
			size="lg"
			opened={open}
			onClose={handleClose}
			aria-labelledby="modal-title"
			aria-describedby="modal-description"
		>
			<Box key={`${title}-card`}>
				<div className="flex flex-row justify-between items-end">
					<Title id="modal-title" order={5}>
						{i18n.t("Select Location(s)")}
					</Title>
					<Button
						onClick={() => {
							onReset();
							handleClose();
						}}
						disabled={isEmpty(orgUnitState)}
						variant="subtle"
					>
						{i18n.t("Reset")}
					</Button>
				</div>

				{orgUnitLoading ? (
					<div className="flex justify-center items-center h-full">
						<Loader size="md" />
					</div>
				) : (
					<div className="flex justify-center items-center h-full pb-2">
						<OrgUnitSelector
							limitSelectionToLevels={limitSelectionToLevels}
							searchable
							value={{
								orgUnits: selectedOrgUnits ?? [],
							}}
							onUpdate={(val: OrgUnitSelection) => {
								setOrgUnits(
									!isEmpty(val.orgUnits)
										? val.orgUnits
										: defaultOrgUnits,
								);
							}}
						/>
					</div>
				)}
				<div className="flex flex-row justify-end gap-2">
					<Button
						onClick={() => {
							handleClose();
						}}
						variant="subtle"
						color="gray"
					>
						{i18n.t("Cancel")}
					</Button>
					<Button
						onClick={() => {
							onUpdate(orgUnits);
							handleClose();
						}}
						disabled={isEmpty(selectedOrgUnits)}
					>
						{i18n.t("Update")}
					</Button>
				</div>
			</Box>
		</Modal>
	);
}

import {
    AppShell,
    Box,
    Container,
    Divider,
    Flex,
    Image,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import {AppTitleConfig, FooterConfig} from "@packages/shared/schemas";
import NextImage from "next/image";
import {FooterLinks} from "@/components/Footer/components/FooterLinks";
import {FooterAddress} from "@/components/Footer/components/FooterAddress";

export function Footer({
                           config,
                           title,
                           logo,
                       }: {
    config: FooterConfig;
    title: AppTitleConfig;
    logo: string;
}) {
    return (
        <div>
                <div className="relative" style={{
                    clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0% 100%)"
                }}>
                    <div className="sticky bottom-[calc(100vh)] h-[240px]"
                    >
                        <AppShell.Footer>
                            <Flex align="center" direction="column" gap="xs">
                                <Container className="min-w-full" size="lg" flex={1}>
                                    <Container size="lg">
                                        <Flex p="md" gap="lg" direction="row">
                                            <Box style={{width: "50%", flex: 1}}>
                                                <Stack align="flex-start" gap={0}>
                                                    <Box style={{width: 80, height: 80}}>
                                                        <Image
                                                            component={NextImage}
                                                            width={80}
                                                            height={80}
                                                            alt="logo"
                                                            src={logo}
                                                            visibleFrom="sm"
                                                            fallbackSrc="https://avatars.githubusercontent.com/u/1089987?s=200&v=4"
                                                        />
                                                    </Box>
                                                    <Title order={5} ta="left">
                                                        {title.main}
                                                    </Title>
                                                    {title.subtitle && (
                                                        <Text size="sm" c="dimmed" ta="center">
                                                            {title.subtitle}
                                                        </Text>
                                                    )}
                                                </Stack>
                                            </Box>
                                            <Flex
                                                flex={1}
                                                gap="lg"
                                                justify="space-between"
                                                direction="row"
                                            >
                                                <FooterLinks config={config.footerLinks}/>
                                                <FooterAddress config={config.address}/>
                                            </Flex>
                                        </Flex>
                                        <Divider my="md"/>
                                    </Container>
                                </Container>
                                <Container size="lg">
                                    <Text c="dimmed" ta="center">
                                        {config.copyright}
                                    </Text>
                                </Container>
                            </Flex>
                        </AppShell.Footer>
                    </div>

                </div>

            </div>




    );
}

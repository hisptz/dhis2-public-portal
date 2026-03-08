import { dbClient } from '@/clients/prisma'
import { compact } from 'lodash'

export async function getRunStatus({
    runId,
    runType,
}: {
    runId: string
    runType: string
}) {
    const [downloads, uploads] =
        runType === 'metadata'
            ? await Promise.all([
                  await dbClient.metadataDownload.findMany({
                      where: {
                          run: {
                              uid: runId,
                          },
                      },
                      select: {
                          status: true,
                      },
                  }),
                  await dbClient.metadataUpload.findMany({
                      where: {
                          run: {
                              uid: runId,
                          },
                      },
                      select: {
                          status: true,
                      },
                  }),
              ])
            : await Promise.all([
                  await dbClient.dataDownload.findMany({
                      where: {
                          run: {
                              uid: runId,
                          },
                      },
                      select: {
                          status: true,
                      },
                  }),
                  await dbClient.dataUpload.findMany({
                      where: {
                          run: {
                              uid: runId,
                          },
                      },
                      select: {
                          status: true,
                      },
                  }),
              ])

    const statuses = compact([
        ...downloads.map((download) => download.status),
        ...uploads.map((upload) => upload.status),
    ])

    if (statuses.length === 0) {
        return {
            status: 'IGNORED',
        }
    }
    if (statuses.length === 1) {
        //They all share a status,
        return {
            status: statuses[0],
        }
    }

    if (statuses.some((status) => ['INIT'].includes(status))) {
        return {
            status: 'RUNNING',
        }
    }
    if (statuses.some((status) => status === 'FAILED')) {
        return {
            status: 'ERRORED',
        }
    }
    if (statuses.every((status) => status === 'DONE')) {
        return {
            status: 'DONE',
        }
    }

    return {
        status: 'UNKNOWN',
    }
}

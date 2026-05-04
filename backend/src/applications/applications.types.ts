import type { ApplicationStatus } from '@prisma/client';

export type Application = {
   id: string;
   title: string;
   description: string;
   status: ApplicationStatus;
   createdBy: string;
   createdAt: Date;
   updatedAt: Date;
};

export type ApplicationsList = {
   data: Application[];
};

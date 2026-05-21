import { Injectable, NotFoundException } from '@nestjs/common'
import { ApplicationStatus } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'
import type { CreateApplicationDto } from './dto/create-application.dto'
import type { UpdateApplicationDto } from './dto/update-application.dto'
import type { Application, ApplicationsList } from './applications.types'

@Injectable()
export class ApplicationsService {
   public constructor(private readonly prismaService: PrismaService) {}

   public async createApplication(
      createdBy: string,
      createApplicationDto: CreateApplicationDto,
   ): Promise<Application> {
      return this.prismaService.application.create({
         data: {
            title: createApplicationDto.title,
            description: createApplicationDto.description,
            status: ApplicationStatus.NEW,
            createdBy,
         },
      })
   }

   public async findAllApplications(): Promise<ApplicationsList> {
      const data = await this.prismaService.application.findMany({
         orderBy: {
            createdAt: 'desc',
         },
      })

      return { data }
   }

   public async findApplicationById(id: string): Promise<Application> {
      const application = await this.prismaService.application.findUnique({
         where: { id },
      })

      if (!application) {
         throw new NotFoundException('Application not found')
      }

      return application
   }

   public async updateApplication(
      id: string,
      updateApplicationDto: UpdateApplicationDto,
   ): Promise<Application> {
      await this.ensureApplicationExists(id)

      return this.prismaService.application.update({
         where: { id },
         data: {
            title: updateApplicationDto.title,
            description: updateApplicationDto.description,
         },
      })
   }

   public async updateApplicationStatus(
      id: string,
      status: ApplicationStatus,
   ): Promise<Application> {
      await this.ensureApplicationExists(id)

      return this.prismaService.application.update({
         where: { id },
         data: { status },
      })
   }

   public async deleteApplication(id: string): Promise<void> {
      await this.ensureApplicationExists(id)

      await this.prismaService.application.delete({
         where: { id },
      })
   }

   private async ensureApplicationExists(id: string): Promise<void> {
      const application = await this.prismaService.application.findUnique({
         where: { id },
         select: { id: true },
      })

      if (!application) {
         throw new NotFoundException('Application not found')
      }
   }
}

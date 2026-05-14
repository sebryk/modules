import {
   Body,
   Controller,
   Delete,
   Get,
   HttpCode,
   HttpStatus,
   Param,
   Patch,
   Post,
   Req,
} from '@nestjs/common';

import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ApplicationsService } from './applications.service';
import type { Application, ApplicationsList } from './applications.types';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import type { AuthenticatedRequest } from '../common/types/api';

@Controller('applications')
export class ApplicationsController {
   public constructor(
      private readonly applicationsService: ApplicationsService,
   ) {}

   @Post()
   @RequirePermission('application:create')
   public async create(
      @Body() createApplicationDto: CreateApplicationDto,
      @Req() request: AuthenticatedRequest,
   ): Promise<Application> {
      return this.applicationsService.createApplication(
         request.user.id,
         createApplicationDto,
      );
   }

   @Get()
   @RequirePermission('application:read')
   public async findAll(): Promise<ApplicationsList> {
      return this.applicationsService.findAllApplications();
   }

   @Get(':id')
   @RequirePermission('application:read')
   public async findOne(@Param('id') id: string): Promise<Application> {
      return this.applicationsService.findApplicationById(id);
   }

   @Patch(':id')
   @RequirePermission('application:update')
   public async update(
      @Param('id') id: string,
      @Body() updateApplicationDto: UpdateApplicationDto,
   ): Promise<Application> {
      return this.applicationsService.updateApplication(
         id,
         updateApplicationDto,
      );
   }

   @Patch(':id/status')
   @RequirePermission('application:update_status')
   public async updateStatus(
      @Param('id') id: string,
      @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
   ): Promise<Application> {
      return this.applicationsService.updateApplicationStatus(
         id,
         updateApplicationStatusDto.status,
      );
   }

   @Delete(':id')
   @HttpCode(HttpStatus.NO_CONTENT)
   @RequirePermission('application:delete')
   public async remove(@Param('id') id: string): Promise<void> {
      await this.applicationsService.deleteApplication(id);
   }
}

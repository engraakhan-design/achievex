import { Module } from '@nestjs/common'; import { DigitalWorkplaceController } from './digital-workplace.controller'; import { DigitalWorkplaceService } from './digital-workplace.service';
@Module({controllers:[DigitalWorkplaceController],providers:[DigitalWorkplaceService],exports:[DigitalWorkplaceService]}) export class DigitalWorkplaceModule{}

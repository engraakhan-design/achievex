import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Application and database health' })
  async health() {
    let database = 'up';
    try { await this.prisma.$queryRaw`SELECT 1`; } catch { database = 'down'; }
    return { status: database === 'up' ? 'ok' : 'degraded', service: 'achievex-api', database, timestamp: new Date().toISOString() };
  }
}

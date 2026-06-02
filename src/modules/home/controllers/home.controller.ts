import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { HomeStatsDto } from '../dtos/home-stats.dto';
import { HomeService } from '../services/home.service';

@ApiTags('Home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get('stats')
  async getStats(): Promise<HomeStatsDto> {
    return await this.homeService.getStats();
  }
}

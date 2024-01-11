import { Controller, Post, Body, Get, Query, Req } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Get('all')
    async getReports(): Promise<any> {
        return this.reportService.getReports();
    }
}
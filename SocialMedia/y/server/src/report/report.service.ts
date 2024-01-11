import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';

@Injectable()
export class ReportService {
    constructor(private readonly prisma: PrismaService) { }

    async getReports(): Promise<any> {
        try {
            const reports = await this.prisma.report.findMany({
                orderBy: {
                    id: 'desc'
                  },
            });
            
            return reports;
        } catch (error) {
            throw error;
        }
    }
}

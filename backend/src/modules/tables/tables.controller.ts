import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto, TableStatus } from './dto/table.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TableStatus as PrismaTableStatus } from '@prisma/client';

@ApiTags('4. Table Management : Tables')
@ApiBearerAuth('JWT-auth')
@Controller('table-management/tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TablesController {
    constructor(private readonly tablesService: TablesService) { }

    @Get()
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER')
    @ApiOperation({ summary: 'Get all tables with pagination' })
    @ApiQuery({ name: 'status', required: false, enum: TableStatus })
    @ApiQuery({ name: 'location', required: false, description: 'Filter by location' })
    async findAll(
        @Query() query: PaginationQueryDto,
        @Query('status') status?: string,
        @Query('location') location?: string,
    ) {
        return this.tablesService.findAll(query.page, query.limit, query.search, status, location);
    }

    @Get(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER')
    @ApiOperation({ summary: 'Get table by UUID' })
    @ApiParam({ name: 'uuid', description: 'Table UUID' })
    async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.tablesService.findOne(uuid);
    }

    @Post()
    @HttpCode(200)
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Create new table' })
    async create(@Body() createTableDto: CreateTableDto, @Request() req) {
        return this.tablesService.create(createTableDto, req.user?.uuid);
    }

    @Put(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Update table by UUID' })
    @ApiParam({ name: 'uuid', description: 'Table UUID' })
    async update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateTableDto: UpdateTableDto,
        @Request() req,
    ) {
        return this.tablesService.update(uuid, updateTableDto, req.user?.uuid);
    }

    @Delete(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Delete table by UUID (soft delete)' })
    @ApiParam({ name: 'uuid', description: 'Table UUID' })
    async remove(@Param('uuid', ParseUUIDPipe) uuid: string, @Request() req) {
        return this.tablesService.remove(uuid, req.user?.uuid);
    }

    @Put(':uuid/status')
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER')
    @ApiOperation({ summary: 'Update table status' })
    @ApiParam({ name: 'uuid', description: 'Table UUID' })
    async updateStatus(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() body: { status: TableStatus },
        @Request() req,
    ) {
        return this.tablesService.updateStatus(uuid, body.status as unknown as PrismaTableStatus, req.user?.uuid);
    }
}

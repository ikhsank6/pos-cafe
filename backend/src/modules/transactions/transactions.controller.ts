import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, RefundTransactionDto, PaymentMethod, TransactionStatus } from './dto/transaction.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('8. Transaction Management : Transactions')
@ApiBearerAuth('JWT-auth')
@Controller('transaction-management/transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Get()
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Get all transactions with pagination' })
    @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
    @ApiQuery({ name: 'paymentMethod', required: false, enum: PaymentMethod })
    @ApiQuery({ name: 'startDate', required: false, description: 'Filter from date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'Filter to date (YYYY-MM-DD)' })
    async findAll(
        @Query() query: PaginationQueryDto,
        @Query('status') status?: string,
        @Query('paymentMethod') paymentMethod?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.transactionsService.findAll(
            query.page,
            query.limit,
            query.search,
            status,
            paymentMethod,
            startDate,
            endDate,
        );
    }

    @Get('daily-report')
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Get daily sales report' })
    @ApiQuery({ name: 'date', required: false, description: 'Date for report (YYYY-MM-DD), defaults to today' })
    async getDailySalesReport(@Query('date') date?: string) {
        return this.transactionsService.getDailySalesReport(date);
    }

    @Get(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Get transaction by UUID' })
    @ApiParam({ name: 'uuid', description: 'Transaction UUID' })
    async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.transactionsService.findOne(uuid);
    }

    @Post()
    @HttpCode(200)
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Create payment for order' })
    async create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
        return this.transactionsService.create(createTransactionDto, req.user?.uuid);
    }

    @Post(':uuid/refund')
    @HttpCode(200)
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Refund transaction' })
    @ApiParam({ name: 'uuid', description: 'Transaction UUID' })
    async refund(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() refundDto: RefundTransactionDto,
        @Request() req,
    ) {
        return this.transactionsService.refund(uuid, refundDto, req.user?.uuid);
    }
}

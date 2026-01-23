import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('3. Product Management : Categories')
@ApiBearerAuth('JWT-auth')
@Controller('product-management/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Get all categories with pagination' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    async findAll(
        @Query() query: PaginationQueryDto,
        @Query('isActive') isActive?: string,
    ) {
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.categoriesService.findAll(query.page, query.limit, query.search, isActiveBoolean);
    }

    @Get(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Get category by UUID' })
    @ApiParam({ name: 'uuid', description: 'Category UUID' })
    async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.categoriesService.findOne(uuid);
    }

    @Post()
    @HttpCode(200)
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Create new category' })
    async create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
        return this.categoriesService.create(createCategoryDto, req.user?.uuid);
    }

    @Put(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Update category by UUID' })
    @ApiParam({ name: 'uuid', description: 'Category UUID' })
    async update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
        @Request() req,
    ) {
        return this.categoriesService.update(uuid, updateCategoryDto, req.user?.uuid);
    }

    @Delete(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Delete category by UUID (soft delete)' })
    @ApiParam({ name: 'uuid', description: 'Category UUID' })
    async remove(@Param('uuid', ParseUUIDPipe) uuid: string, @Request() req) {
        return this.categoriesService.remove(uuid, req.user?.uuid);
    }
}

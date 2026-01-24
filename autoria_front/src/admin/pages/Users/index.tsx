import { useState } from "react";
import {Link, useLocation, useNavigate} from "react-router";
import { BoxIcon } from "../../../icons";
import {
    Table, TableBody, TableCell, TableHeader, TableRow
} from "../../../components/ui/table";
import {
    useSearchUsersQuery
} from "../../../services/apiUser.ts";
import LoadingOverlay from "../../../components/ui/loading/LoadingOverlay.tsx";
import UserTableItem from "../../../components/ui/table/item/UserTableItem.tsx";
import { DatePicker, Checkbox } from 'antd';
import dayjs from 'dayjs';
import type {IUserSearchParams} from "../../../services/types.ts";
const { RangePicker } = DatePicker;

const ITEMS_PER_PAGE = 10;

const UserListPage: React.FC = () => {
    const [filtersOpen, setFiltersOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const parseQueryParams = (): IUserSearchParams => {
        const params = new URLSearchParams(location.search);
        return {
            name: params.get("name") || "",
            roles: params.getAll("roles") || undefined,
            startDate: params.get("startDate") || undefined,
            endDate: params.get("endDate") || undefined,
            page: parseInt(params.get("page") || "1", 10),
            itemPerPage: parseInt(params.get("itemPerPage") || `${ITEMS_PER_PAGE}`, 10),
        };
    };

    const [searchParams, setSearchParamsState] = useState<IUserSearchParams>(parseQueryParams());

    const updateSearchParams = (updated: Partial<IUserSearchParams>) => {
        const newParams = { ...searchParams, ...updated };
        setSearchParamsState(newParams);

        const urlParams = new URLSearchParams();

        if (newParams.name) urlParams.set("name", newParams.name);
        if (newParams.roles) newParams.roles.forEach(role => urlParams.append("roles", role));
        if (newParams.startDate) urlParams.set("startDate", newParams.startDate);
        if (newParams.endDate) urlParams.set("endDate", newParams.endDate);
        if (newParams.page) urlParams.set("page", newParams.page.toString());
        if (newParams.itemPerPage) urlParams.set("itemPerPage", newParams.itemPerPage.toString());

        navigate({ search: urlParams.toString() }, { replace: true });
    };

    const { data, isLoading, isError } = useSearchUsersQuery(searchParams);

    const handlePageChange = (newPage: number) => {
        updateSearchParams({ page: newPage });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateSearchParams({
            [name]: name === "itemPerPage" ? parseInt(value) || 1 : value,
            page: 1,
        });
    };

    const handleRoleChange = (role: string, checked: boolean) => {
        const currentRoles = searchParams.roles || [];
        const updatedRoles = checked
            ? [...new Set([...currentRoles, role])]
            : currentRoles.filter(r => r !== role);

        updateSearchParams({
            roles: updatedRoles.length > 0 ? updatedRoles : undefined,
            page: 1,
        });
    };
    //@ts-ignore
    const handleDateChange = (dates) => {
        if (!dates) {
            updateSearchParams({ startDate: undefined, endDate: undefined, page: 1 });
            return;
        }

        updateSearchParams({
            startDate: dates[0]?.toISOString(),
            endDate: dates[1]?.toISOString(),
            page: 1,
        });
    };

    if (isLoading) return <LoadingOverlay />;
    if (isError) return <p className="text-gray-600 dark:text-gray-400">Something went wrong.</p>;

    const users = data?.items || [];
    const pagination = data?.pagination;

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">

                <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Users
                    </h3>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setFiltersOpen(prev => !prev)}
                            className="btn dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>
                </div>

                {filtersOpen && (
                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Пошук по імені */}
                        <div className="flex flex-col">
                            <label htmlFor="name" className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Пошук за ім'ям
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Введіть ім'я"
                                className="input dark:bg-gray-800 dark:text-white"
                                value={searchParams.name}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Ролі */}
                        <div className="flex flex-col">
                            <span className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Фільтр за ролями
                            </span>
                            <div className="flex gap-4">
                                <Checkbox
                                    checked={searchParams.roles?.includes('User')}
                                    onChange={(e) => handleRoleChange('User', e.target.checked)}
                                >
                                    User
                                </Checkbox>
                                <Checkbox
                                    checked={searchParams.roles?.includes('Admin')}
                                    onChange={(e) => handleRoleChange('Admin', e.target.checked)}
                                >
                                    Admin
                                </Checkbox>
                            </div>
                        </div>

                        {/* Діапазон дат */}
                        <div className="flex flex-col">
                            <label htmlFor="dateRange" className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Діапазон дат створення
                            </label>
                            <RangePicker
                                id="dateRange"
                                className="dark:bg-gray-800 dark:text-white"
                                onChange={handleDateChange}
                                value={
                                    searchParams.startDate && searchParams.endDate
                                        ? [dayjs(searchParams.startDate), dayjs(searchParams.endDate)]
                                        : null
                                }
                            />
                        </div>

                        {/* Кількість елементів на сторінці */}
                        <div className="flex flex-col">
                            <label htmlFor="itemPerPage" className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Елементів на сторінці
                            </label>
                            <input
                                id="itemPerPage"
                                type="number"
                                name="itemPerPage"
                                placeholder="Кількість"
                                className="input dark:bg-gray-800 dark:text-white w-full"
                                value={searchParams.itemPerPage}
                                onChange={handleInputChange}
                                min={1}
                            />
                        </div>

                    </div>
                )}

                <Link
                    to="#"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg shadow-md hover:bg-green-400 transition mb-3 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                    <BoxIcon className="text-black dark:text-gray-300 w-5 h-5" />
                    Створити
                </Link>

                {/* Table */}
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                            <TableRow>
                                <TableCell isHeader>Id</TableCell>
                                <TableCell isHeader>Full Name</TableCell>
                                <TableCell isHeader>Email</TableCell>
                                <TableCell isHeader>Created</TableCell>
                                <TableCell isHeader>Roles</TableCell>
                                <TableCell isHeader>Login types</TableCell>
                                <TableCell isHeader>Image</TableCell>
                                <TableCell isHeader>Action</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {users.map(user => (
                                <UserTableItem key={user.id} user={user} />
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-6 gap-2 flex-wrap text-sm text-gray-700 dark:text-gray-300">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                            className="btn px-3"
                        >
                            ←
                        </button>

                        {pagination.currentPage > 2 && (
                            <>
                                <button onClick={() => handlePageChange(1)} className="btn px-3">1</button>
                                {pagination.currentPage > 3 && <span className="px-2">...</span>}
                            </>
                        )}

                        {[-1, 0, 1].map(offset => {
                            const page = pagination.currentPage + offset;
                            if (page <= 0 || page > pagination.totalPages) return null;

                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`btn px-3 ${page === pagination.currentPage ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        {pagination.currentPage < pagination.totalPages - 1 && (
                            <>
                                {pagination.currentPage < pagination.totalPages - 2 && <span className="px-2">...</span>}
                                <button onClick={() => handlePageChange(pagination.totalPages)} className="btn px-3">
                                    {pagination.totalPages}
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                            className="btn px-3"
                        >
                            →
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default UserListPage;

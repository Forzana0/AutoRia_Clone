import React, { useRef } from "react";
import {useDeleteCategoryMutation, useGetAllCategoriesQuery} from "../../services/apiCategory.ts";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {APP_ENV} from "../../env";
import {Link} from "react-router";
import {BoxIcon} from "../../icons";
import {Button, Space} from "antd";
import {CloseCircleFilled, EditOutlined} from "@ant-design/icons";
import DeleteConfirmModal, {type DeleteConfirmModalRef} from "../../components/common/DeleteConfirmModal.tsx";

const CategoriesListPage: React.FC = () => {

    const { data: categories, isLoading, isError } = useGetAllCategoriesQuery();

    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

    const modalRef = useRef<DeleteConfirmModalRef>(null);

    if (isLoading) return <p>Loading...</p>;
    if (isError || !categories) return <p>Something went wrong.</p>;

    const handleDelete = async (id: number) => {
        await deleteCategory(id);
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Categories
                </h3>
                <div className="flex items-center gap-3">
                    <button className="btn">Filter</button>
                    <button className="btn">See all</button>
                </div>
            </div>

            <Link
                to="create"
                className="inline-flex items-center
                gap-2 px-4 py-2 bg-white text-black text-sm
                font-medium rounded-lg shadow-md
                hover:bg-green-400 transition mb-3"
            >
                <BoxIcon className="text-black w-5 h-5" />
                Додати
            </Link>

            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 text-start">Category</TableCell>
                            <TableCell isHeader className="py-3 text-start">Slug</TableCell>
                            <TableCell isHeader className="py-3 text-start">Image</TableCell>
                            <TableCell isHeader className="py-3 text-start">Action</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">
                                    {category.name}
                                </TableCell>

                                <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                                    {category.slug}
                                </TableCell>

                                <TableCell className="py-3">
                                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                                        <img
                                            src={`${APP_ENV.IMAGES_100_URL}${category.image}`}
                                            alt={category.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="py-3">
                                    <Space size="middle">
                                        <Link to={`edit/${category.id}`}>
                                            <Button icon={<EditOutlined />} />
                                        </Link>
                                        <Button danger icon={<CloseCircleFilled />} onClick={() => modalRef.current?.open(category.id)} />
                                    </Space>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <DeleteConfirmModal ref={modalRef} onDelete={handleDelete} loading={isDeleting} />
        </div>
    );
}

export default CategoriesListPage;
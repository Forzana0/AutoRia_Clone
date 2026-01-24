import type {IAdminUserItem} from "../../../../services/types.ts";
import {TableCell, TableRow} from "../index.tsx";
import {APP_ENV} from "../../../../env";
import {Button, Space} from "antd";
import {Link} from "react-router";
import {CloseCircleFilled, EditOutlined} from "@ant-design/icons";

interface UserTableItemProps {
    user: IAdminUserItem;
}

const UserTableItem: React.FC<UserTableItemProps> = ({
                                                             user
                                                         }) => {
    return(
        <>
            <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">
                    {user.id}
                </TableCell>

                <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                    {user.fullName}
                </TableCell>

                <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                    {user.email}
                </TableCell>

                <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                    {new Date(user.dateCreated).toLocaleDateString()}
                </TableCell>

                <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                    {user.roles.map((role, index) => (
                        <span key={role}>
                            {role}
                            {index < user.roles.length - 1 && ', '}
                        </span>
                    ))}
                </TableCell>

                <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                    {user.loginTypes.map((type, index) => (
                        <span key={type}>
                            {type}
                            {index < user.loginTypes.length - 1 && ', '}
                        </span>
                    ))}
                </TableCell>


                <TableCell className="py-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                        <img
                            src={user.image ? `${APP_ENV.IMAGES_100_URL}${user.image}` : '/images/user/default.png'}
                            alt={user.fullName}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </TableCell>

                <TableCell className="py-3">
                    <Space size="middle">
                        <Link to={`#`}>
                            <Button icon={<EditOutlined />} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" />
                        </Link>

                        <Button danger icon={<CloseCircleFilled />}/>
                    </Space>
                </TableCell>
            </TableRow>
        </>
    );
}

export default UserTableItem;
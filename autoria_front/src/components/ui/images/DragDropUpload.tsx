import { Upload, Button, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";

import type { UploadFile } from "antd";
import type {RcFile, UploadChangeParam} from "antd/es/upload/interface";
import type { DropResult } from "@hello-pangea/dnd";

interface DragDropUploadProps {
    fileList: UploadFile[];
    setFileList: (files: UploadFile[]) => void;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({ fileList, setFileList }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");

    const onUploadChange = ({ fileList: newList }: UploadChangeParam<UploadFile<any>>) => {
        setFileList(newList.filter(f => f.status !== "removed"));
    };

    const beforeUpload = (): boolean => false;

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(fileList);
        const [moved] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, moved);
        setFileList(items);
    };

    const handleRemove = (uid: string) => {
        setFileList(fileList.filter(f => f.uid !== uid));
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview && file.originFileObj) {
            file.preview = URL.createObjectURL(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    return (
        <div className="space-y-4">
            <Upload
                multiple
                beforeUpload={beforeUpload}
                fileList={fileList}
                onChange={onUploadChange}
                showUploadList={false}
            >
                <Button icon={<UploadOutlined />}>Вибрати файли</Button>
            </Upload>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="upload-list" direction="vertical">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="flex flex-col gap-4"
                        >
                            {fileList.map((file, index) => (
                                <Draggable key={file.uid} draggableId={file.uid} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="w-32"
                                        >
                                            <Upload
                                                listType="picture-card"
                                                fileList={[file]}
                                                onRemove={() => handleRemove(file.uid)}
                                                onPreview={() => handlePreview(file)}
                                                showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <Modal
                open={previewOpen}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
            >
                <img alt="preview" className="w-full" src={previewImage} />
            </Modal>
        </div>
    );
};

export default DragDropUpload;

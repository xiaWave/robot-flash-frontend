import { useState } from 'react';
import { Version, DeviceType } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Plus, Pencil, Trash2, Upload, CheckCircle } from 'lucide-react';

interface VersionManagementProps {
  versions: Version[];
  deviceTypes: DeviceType[];
  onAdd: (version: Version) => void;
  onEdit: (version: Version) => void;
  onDelete: (id: string) => void;
}

export function VersionManagement({
  versions,
  deviceTypes,
  onAdd,
  onEdit,
  onDelete,
}: VersionManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [formData, setFormData] = useState({
    versionNumber: '',
    releaseDate: '',
    description: '',
    fileSize: '',
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);

    // 模拟文件上传进度
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      setUploadProgress(i);
    }

    setIsUploading(false);
    setUploadComplete(true);

    // 自动填充文件大小
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFormData({
      ...formData,
      fileSize: `${fileSizeInMB}MB`,
    });
  };

  const handleSubmit = () => {
    if (
      !formData.versionNumber ||
      !formData.releaseDate ||
      !formData.fileSize ||
      (!editingVersion && !uploadFile)
    )
      return;

    if (editingVersion) {
      onEdit({
        ...editingVersion,
        ...formData,
      });
    } else {
      onAdd({
        id: Date.now().toString(),
        ...formData,
        fileName: uploadFile?.name,
        filePath: `/uploads/${uploadFile?.name}`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      versionNumber: '',
      releaseDate: '',
      description: '',
      fileSize: '',
    });
    setUploadFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadComplete(false);
    setEditingVersion(null);
  };

  const handleEdit = (version: Version) => {
    setEditingVersion(version);
    setFormData({
      versionNumber: version.versionNumber,
      releaseDate: version.releaseDate,
      description: version.description,
      fileSize: version.fileSize,
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>版本管理</CardTitle>
            <CardDescription>管理固件版本文件</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加版本
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  {editingVersion ? '编辑版本' : '添加版本'}
                </DialogTitle>
                <DialogDescription>填写固件版本信息并上传文件</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {!editingVersion && (
                  <div className="space-y-2">
                    <Label htmlFor="file">上传固件文件</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      {!uploadFile ? (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                          <div>
                            <Label
                              htmlFor="file"
                              className="cursor-pointer text-primary hover:underline"
                            >
                              点击选择文件
                            </Label>
                            <Input
                              id="file"
                              type="file"
                              className="hidden"
                              onChange={handleFileChange}
                              accept=".bin,.hex,.fw,.img"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            支持 .bin, .hex, .fw, .img 格式
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            {uploadComplete ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Upload className="w-5 h-5 text-primary" />
                            )}
                            <span className="text-sm">{uploadFile.name}</span>
                          </div>
                          {isUploading && (
                            <div className="space-y-2">
                              <Progress value={uploadProgress} />
                              <p className="text-xs text-muted-foreground">
                                上传中... {uploadProgress}%
                              </p>
                            </div>
                          )}
                          {uploadComplete && (
                            <p className="text-xs text-green-600">上传完成！</p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUploadFile(null);
                              setUploadProgress(0);
                              setUploadComplete(false);
                            }}
                          >
                            重新选择
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="versionNumber">版本号</Label>
                  <Input
                    id="versionNumber"
                    value={formData.versionNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, versionNumber: e.target.value })
                    }
                    placeholder="例如：v1.2.0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="releaseDate">发布日期</Label>
                  <Input
                    id="releaseDate"
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, releaseDate: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fileSize">文件大小</Label>
                  <Input
                    id="fileSize"
                    value={formData.fileSize}
                    onChange={(e) =>
                      setFormData({ ...formData, fileSize: e.target.value })
                    }
                    placeholder="例如：128MB"
                    disabled={!!uploadFile}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="版本更新内容说明"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleDialogClose(false)}>
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={isUploading}>
                  {editingVersion ? '保存' : '添加'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>版本号</TableHead>
              <TableHead>文件名</TableHead>
              <TableHead>发布日期</TableHead>
              <TableHead>文件大小</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell>
                  <Badge variant="secondary">{version.versionNumber}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {version.fileName || '-'}
                </TableCell>
                <TableCell>{version.releaseDate}</TableCell>
                <TableCell>{version.fileSize}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {version.description}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(version)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(version.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

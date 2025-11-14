import { useState } from 'react';
import { ResourceType, ResourceCategory } from '../types';
import { resourceTypeApi } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import {
  useResourceListQuery,
  useCreateResourceMutation,
} from '../features/resource/useResourceQueries';

export function ResourceTypePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'device' as ResourceCategory,
    model: '',
    manufacturer: '',
    version: '',
    type: '',
    osType: '',
    architecture: '',
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resourcesQuery = useResourceListQuery({
    page,
    pageSize,
  });
  const total = resourcesQuery.data?.total ?? 0;
  const resourceMutation = useCreateResourceMutation();

  const handleSubmit = async () => {
    if (!formData.name) return;

    try {
      const data: any = { name: formData.name, category: formData.category };

      if (formData.category === 'device') {
        data.model = formData.model;
        data.manufacturer = formData.manufacturer;
      } else if (formData.category === 'software') {
        data.version = formData.version;
        data.type = formData.type;
      } else if (formData.category === 'system') {
        data.osType = formData.osType;
        data.architecture = formData.architecture;
      }

      if (editingResource) {
        await resourceTypeApi.update(editingResource.id, data);
      } else {
        await resourceMutation.mutateAsync(data);
      }
      setIsDialogOpen(false);
      resetForm();
      resourcesQuery.refetch();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'device',
      model: '',
      manufacturer: '',
      version: '',
      type: '',
      osType: '',
      architecture: '',
    });
    setEditingResource(null);
  };

  const handleEdit = (resource: ResourceType) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      category: resource.category,
      model: resource.model || '',
      manufacturer: resource.manufacturer || '',
      version: resource.version || '',
      type: resource.type || '',
      osType: resource.osType || '',
      architecture: resource.architecture || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      await resourceTypeApi.delete(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      resourcesQuery.refetch();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const getCategoryLabel = (category: ResourceCategory) => {
    const labels = { device: '终端设备', software: '软件', system: '系统' };
    return labels[category];
  };

  const getCategoryColor = (category: ResourceCategory) => {
    const colors = {
      device: 'bg-blue-500',
      software: 'bg-green-500',
      system: 'bg-purple-500',
    };
    return colors[category];
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-slate-900 mb-1">资源类型管理</h1>
        <p className="text-slate-600 text-sm">统一管理终端设备、软件和系统资源</p>
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>资源类型列表</CardTitle>
              <CardDescription className="text-sm mt-1">
                管理设备类型和软件资源
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  添加资源
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingResource ? '编辑资源' : '添加资源'}
                  </DialogTitle>
                  <DialogDescription>
                    填写资源的基本信息
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>资源类型</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) =>
                        setFormData({ ...formData, category: v as ResourceCategory })
                      }
                      disabled={!!editingResource}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="device">终端设备</SelectItem>
                        <SelectItem value="software">软件</SelectItem>
                        <SelectItem value="system">系统</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>名称</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="资源名称"
                    />
                  </div>

                  {formData.category === 'device' && (
                    <>
                      <div className="grid gap-2">
                        <Label>型号</Label>
                        <Input
                          value={formData.model}
                          onChange={(e) =>
                            setFormData({ ...formData, model: e.target.value })
                          }
                          placeholder="例如：RT-X1000"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>制造商</Label>
                        <Input
                          value={formData.manufacturer}
                          onChange={(e) =>
                            setFormData({ ...formData, manufacturer: e.target.value })
                          }
                          placeholder="例如：科技公司A"
                        />
                      </div>
                    </>
                  )}

                  {formData.category === 'software' && (
                    <>
                      <div className="grid gap-2">
                        <Label>版本</Label>
                        <Input
                          value={formData.version}
                          onChange={(e) =>
                            setFormData({ ...formData, version: e.target.value })
                          }
                          placeholder="例如：8.0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>类型</Label>
                        <Input
                          value={formData.type}
                          onChange={(e) =>
                            setFormData({ ...formData, type: e.target.value })
                          }
                          placeholder="例如：database"
                        />
                      </div>
                    </>
                  )}

                  {formData.category === 'system' && (
                    <>
                      <div className="grid gap-2">
                        <Label>操作系统类型</Label>
                        <Input
                          value={formData.osType}
                          onChange={(e) =>
                            setFormData({ ...formData, osType: e.target.value })
                          }
                          placeholder="例如：Linux"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>架构</Label>
                        <Input
                          value={formData.architecture}
                          onChange={(e) =>
                            setFormData({ ...formData, architecture: e.target.value })
                          }
                          placeholder="例如：x86_64"
                        />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => handleDialogClose(false)}>
                    取消
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingResource ? '保存' : '添加'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {resourcesQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>详细信息</TableHead>
                    <TableHead>创建日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(resourcesQuery.data?.data.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    resourcesQuery.data?.data.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>{resource.name}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(resource.category)}>
                            {getCategoryLabel(resource.category)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {resource.category === 'device' && (
                            <span>
                              {resource.model} • {resource.manufacturer}
                            </span>
                          )}
                          {resource.category === 'software' && (
                            <span>
                              v{resource.version} • {resource.type}
                            </span>
                          )}
                          {resource.category === 'system' && (
                            <span>
                              {resource.osType} • {resource.architecture}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{resource.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(resource)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(resource.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <Pagination
                currentPage={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="确认删除资源"
        description="删除后将无法恢复，确定要删除该资源吗？"
      />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { SoftwareType } from '../types';
import { softwareTypeApi } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
import { Badge } from './ui/badge';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Pagination } from './Pagination';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

export function SoftwareTypeList() {
  const [softwares, setSoftwares] = useState<SoftwareType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<SoftwareType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    type: '',
  });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [page, pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await softwareTypeApi.getList(page, pageSize);
      setSoftwares(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.version || !formData.type) return;

    try {
      if (editingSoftware) {
        await softwareTypeApi.update(editingSoftware.id, formData);
      } else {
        await softwareTypeApi.create(formData);
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', version: '', type: '' });
    setEditingSoftware(null);
  };

  const handleEdit = (software: SoftwareType) => {
    setEditingSoftware(software);
    setFormData({
      name: software.name,
      version: software.version,
      type: software.type,
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
      await softwareTypeApi.delete(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      loadData();
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

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      database: '数据库',
      storage: '存储',
      container: '容器',
      webserver: 'Web服务器',
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加软件类型
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSoftware ? '编辑软件类型' : '添加软件类型'}
              </DialogTitle>
              <DialogDescription>
                填写软件的基本信息
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">软件名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="例如：MySQL"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version">版本</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  placeholder="例如：8.0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">类型</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  placeholder="例如：database"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit}>
                {editingSoftware ? '保存' : '添加'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>软件名称</TableHead>
                <TableHead>版本</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>创建日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {softwares.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                softwares.map((software) => (
                  <TableRow key={software.id}>
                    <TableCell>{software.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{software.version}</Badge>
                    </TableCell>
                    <TableCell>{getTypeLabel(software.type)}</TableCell>
                    <TableCell>{software.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(software)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(software.id)}
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="确认删除软件类型"
        description="删除后将无法恢复，确定要删除该软件类型吗？"
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { DeviceType } from '../types';
import { deviceTypeApi } from '../services/api';
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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Pagination } from './Pagination';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

export function DeviceTypeList() {
  const [devices, setDevices] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
  });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [page, pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await deviceTypeApi.getList(page, pageSize);
      setDevices(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.model || !formData.manufacturer) return;

    try {
      if (editingDevice) {
        await deviceTypeApi.update(editingDevice.id, formData);
      } else {
        await deviceTypeApi.create(formData);
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', model: '', manufacturer: '' });
    setEditingDevice(null);
  };

  const handleEdit = (device: DeviceType) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      model: device.model,
      manufacturer: device.manufacturer,
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
      await deviceTypeApi.delete(deletingId);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加机器类型
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDevice ? '编辑机器类型' : '添加机器类型'}
              </DialogTitle>
              <DialogDescription>
                填写机器的基本信息
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="例如：智能路由器 Pro"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">型号</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  placeholder="例如：RT-X1000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="manufacturer">制造商</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                  placeholder="例如：科技公司A"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit}>
                {editingDevice ? '保存' : '添加'}
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
                <TableHead>名称</TableHead>
                <TableHead>型号</TableHead>
                <TableHead>制造商</TableHead>
                <TableHead>创建日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>{device.model}</TableCell>
                    <TableCell>{device.manufacturer}</TableCell>
                    <TableCell>{device.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(device)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(device.id)}
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
        title="确认删除机器类型"
        description="删除后将无法恢复，确定要删除该机器类型吗？"
      />
    </div>
  );
}

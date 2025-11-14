import { useState } from 'react';
import { DeviceType } from '../App';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface DeviceTypeManagementProps {
  deviceTypes: DeviceType[];
  onAdd: (device: DeviceType) => void;
  onEdit: (device: DeviceType) => void;
  onDelete: (id: string) => void;
}

export function DeviceTypeManagement({
  deviceTypes,
  onAdd,
  onEdit,
  onDelete,
}: DeviceTypeManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.model || !formData.manufacturer) return;

    if (editingDevice) {
      onEdit({
        ...editingDevice,
        ...formData,
      });
    } else {
      onAdd({
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      });
    }

    setIsDialogOpen(false);
    resetForm();
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
            <CardTitle>机器类型管理</CardTitle>
            <CardDescription>管理所有支持的机器型号和类型</CardDescription>
          </div>
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
      </CardHeader>
      <CardContent>
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
            {deviceTypes.map((device) => (
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
                      onClick={() => onDelete(device.id)}
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

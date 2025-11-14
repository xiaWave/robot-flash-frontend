import { useState } from 'react';
import { FlashRecord, DeviceType, Version } from '../App';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
import { Search } from 'lucide-react';

interface FlashRecordsProps {
  records: FlashRecord[];
  deviceTypes: DeviceType[];
  versions: Version[];
}

export function FlashRecords({ records, deviceTypes, versions }: FlashRecordsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getDeviceTypeName = (deviceTypeId: string) => {
    const device = deviceTypes.find((d) => d.id === deviceTypeId);
    return device ? device.name : '未知';
  };

  const getVersionNumber = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    return version ? version.versionNumber : '未知';
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.deviceSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.deviceIp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDeviceTypeName(record.deviceTypeId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: FlashRecord['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">成功</Badge>;
      case 'failed':
        return <Badge variant="destructive">失败</Badge>;
      case 'processing':
        return <Badge variant="secondary">进行中</Badge>;
    }
  };

  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return '-';
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const duration = Math.floor((end - start) / 1000 / 60);
    return `${duration}分钟`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>刷机记录</CardTitle>
        <CardDescription>查看所有刷机操作的历史记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索序列号、操作员或机器类型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
              <SelectItem value="processing">进行中</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>设备序列号</TableHead>
              <TableHead>机器类型</TableHead>
              <TableHead>固件版本</TableHead>
              <TableHead>设备IP</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>开始时间</TableHead>
              <TableHead>耗时</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  暂无记录
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.deviceSerialNumber}</TableCell>
                  <TableCell>{getDeviceTypeName(record.deviceTypeId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getVersionNumber(record.versionId)}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.deviceIp}:{record.devicePort}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>{record.startTime}</TableCell>
                  <TableCell>
                    {calculateDuration(record.startTime, record.endTime)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-4 text-sm text-muted-foreground">
          共 {filteredRecords.length} 条记录
        </div>
      </CardContent>
    </Card>
  );
}
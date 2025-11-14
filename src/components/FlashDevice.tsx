import { useState } from 'react';
import { DeviceType, Version, FlashRecord } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface FlashDeviceProps {
  deviceTypes: DeviceType[];
  versions: Version[];
  onFlash: (record: FlashRecord) => void;
}

export function FlashDevice({ deviceTypes, versions, onFlash }: FlashDeviceProps) {
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [deviceIp, setDeviceIp] = useState('');
  const [devicePort, setDevicePort] = useState('22');
  const [deviceUsername, setDeviceUsername] = useState('');
  const [devicePassword, setDevicePassword] = useState('');
  const [isFlashing, setIsFlashing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [flashResult, setFlashResult] = useState<'success' | 'failed' | null>(null);

  const handleFlash = async () => {
    if (
      !selectedDeviceType ||
      !selectedVersion ||
      !serialNumber ||
      !deviceIp ||
      !devicePort ||
      !deviceUsername ||
      !devicePassword
    ) {
      return;
    }

    setIsFlashing(true);
    setProgress(0);
    setFlashResult(null);

    const startTime = new Date().toISOString().replace('T', ' ').split('.')[0];

    // 模拟刷机进度
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(i);
    }

    // 模拟成功率 90%
    const success = Math.random() > 0.1;
    const endTime = new Date().toISOString().replace('T', ' ').split('.')[0];

    const record: FlashRecord = {
      id: Date.now().toString(),
      deviceTypeId: selectedDeviceType,
      versionId: selectedVersion,
      deviceSerialNumber: serialNumber,
      deviceIp,
      devicePort,
      deviceUsername,
      status: success ? 'success' : 'failed',
      startTime,
      endTime,
    };

    onFlash(record);
    setFlashResult(success ? 'success' : 'failed');
    setIsFlashing(false);

    if (success) {
      // 成功后清空表单
      setTimeout(() => {
        setSelectedDeviceType('');
        setSelectedVersion('');
        setSerialNumber('');
        setDeviceIp('');
        setDevicePort('22');
        setDeviceUsername('');
        setDevicePassword('');
        setFlashResult(null);
        setProgress(0);
      }, 3000);
    }
  };

  const canFlash =
    selectedDeviceType &&
    selectedVersion &&
    serialNumber &&
    deviceIp &&
    devicePort &&
    deviceUsername &&
    devicePassword &&
    !isFlashing;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>刷机操作</CardTitle>
          <CardDescription>选择设备和版本进行刷机</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceType">机器类型</Label>
            <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
              <SelectTrigger>
                <SelectValue placeholder="选择机器类型" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name} ({device.model})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">固件版本</Label>
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger>
                <SelectValue placeholder="选择固件版本" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.versionNumber} - {version.fileSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">设备序列号</Label>
            <Input
              id="serialNumber"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="例如：SN20240001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deviceIp">设备IP</Label>
              <Input
                id="deviceIp"
                value={deviceIp}
                onChange={(e) => setDeviceIp(e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="devicePort">端口</Label>
              <Input
                id="devicePort"
                value={devicePort}
                onChange={(e) => setDevicePort(e.target.value)}
                placeholder="22"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deviceUsername">用户名</Label>
              <Input
                id="deviceUsername"
                value={deviceUsername}
                onChange={(e) => setDeviceUsername(e.target.value)}
                placeholder="root"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="devicePassword">密码</Label>
              <Input
                id="devicePassword"
                type="password"
                value={devicePassword}
                onChange={(e) => setDevicePassword(e.target.value)}
                placeholder="密码"
              />
            </div>
          </div>

          <Button
            onClick={handleFlash}
            disabled={!canFlash}
            className="w-full"
            size="lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isFlashing ? '刷机中...' : '开始刷机'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>刷机状态</CardTitle>
          <CardDescription>实时监控刷机进度</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isFlashing && !flashResult && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Zap className="w-16 h-16 mb-4" />
              <p>等待开始刷机...</p>
            </div>
          )}

          {isFlashing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>刷机进度</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• 连接设备 {deviceIp}:{devicePort}...</p>
                <p>• 验证用户身份...</p>
                <p>• 正在准备固件包...</p>
                <p>• 写入固件数据...</p>
                <p>• 验证固件完整性...</p>
              </div>
            </div>
          )}

          {flashResult === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                刷机成功！设备已更新到最新版本。
              </AlertDescription>
            </Alert>
          )}

          {flashResult === 'failed' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                刷机失败！请检查设备连接和登录信息后重试。
              </AlertDescription>
            </Alert>
          )}

          {selectedVersion && !isFlashing && !flashResult && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm">版本信息</h4>
              {(() => {
                const version = versions.find((v) => v.id === selectedVersion);
                const device = deviceTypes.find(
                  (d) => d.id === selectedDeviceType
                );
                return version ? (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {device && <p>机器类型：{device.name}</p>}
                    <p>版本号：{version.versionNumber}</p>
                    <p>发布日期：{version.releaseDate}</p>
                    <p>文件大小：{version.fileSize}</p>
                    {version.description && <p>描述：{version.description}</p>}
                    {version.fileName && <p>文件名：{version.fileName}</p>}
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

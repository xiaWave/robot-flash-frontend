import {
  DeviceType,
  FlashRecord,
  FlashTask,
  ResourceType,
  Version,
} from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let mockResources: ResourceType[] = [];
let mockDeviceTypes: DeviceType[] = [];
let mockVersions: Version[] = [];
let mockFlashRecords: FlashRecord[] = [];
let mockTasks: FlashTask[] = [];

export const mockAdapter = {
  seed(initialData: {
    resources: ResourceType[];
    deviceTypes: DeviceType[];
    versions: Version[];
    flashRecords: FlashRecord[];
    tasks: FlashTask[];
  }) {
    mockResources = initialData.resources;
    mockDeviceTypes = initialData.deviceTypes;
    mockVersions = initialData.versions;
    mockFlashRecords = initialData.flashRecords;
    mockTasks = initialData.tasks;
  },

  async getResourceTypes(page: number, pageSize: number, category?: string) {
    await delay(150);
    const filtered = category
      ? mockResources.filter((resource) => resource.category === category)
      : mockResources;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: filtered.slice(start, end),
      total: filtered.length,
    };
  },
};

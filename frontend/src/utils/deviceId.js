// frontend/src/utils/deviceId.js

const STORAGE_KEY = 'jiegasuan_device_id';

export function getDeviceId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function getShortDeviceId() {
  const id = getDeviceId();
  return id.substring(0, 12) + '...';
}

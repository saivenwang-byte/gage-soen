import { formatVersionLabel } from '../config/version';

/** 全局右下角灰色版次（不挡操作） */
export default function VersionStamp() {
  return (
    <p className="app-version-stamp" aria-label={`当前版本 ${formatVersionLabel()}`}>
      {formatVersionLabel()}
    </p>
  );
}

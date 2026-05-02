export type DiffResult = {
  added: string[];
  removed: string[];
  changed: { key: string; from: any; to: any }[];
};

export const diffObjects = (
  obj1: Record<string, any>,
  obj2: Record<string, any>
): DiffResult => {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: { key: string; from: any; to: any }[] = [];

  const keys1 = Object.keys(obj1 || {});
  const keys2 = Object.keys(obj2 || {});

  const allKeys = new Set([...keys1, ...keys2]);

  for (const key of allKeys) {
    const v1 = obj1?.[key];
    const v2 = obj2?.[key];

    if (v1 === undefined) added.push(key);
    else if (v2 === undefined) removed.push(key);
    else if (JSON.stringify(v1) !== JSON.stringify(v2)) {
      changed.push({ key, from: v1, to: v2 });
    }
  }

  return { added, removed, changed };
};
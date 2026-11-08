/**
 * 测试数据的“资料完整度”：测试地点、运营商、宽带、日期、工具、服务器、原始证据、来源。
 *
 * 规则：来源没写、本站也没核对到的项目一律标「待验证」，不推测、不补填；
 * 只写了一部分的（例如“中国大陆（城市未注明）”“只知道不晚于 14:14”）标「部分」。
 */
import type { TestRecord } from "@/utils/testRecords";
import type { NodeCheck } from "@/data/node-checks";
import {
  DATA_SOURCE_LABEL,
  TOOL_LABEL,
  runTime,
  type TestRun,
} from "@/utils/testRuns";

/** ok 已知；partial 只知道一部分；pending 待验证；na 这类数据本来就没有这一项（例如节点核验没有测速服务器） */
export type FieldStatus = "ok" | "partial" | "pending" | "na";

export type FieldState = {
  key:
    | "location"
    | "carrier"
    | "bandwidth"
    | "date"
    | "tool"
    | "server"
    | "evidence"
    | "source";
  label: string;
  status: FieldStatus;
  /** 已知的内容；待验证时为 null */
  value: string | null;
  /** 补充说明（例如为什么只算部分） */
  note?: string;
};

export const PENDING_TEXT = "待验证";

const UNKNOWN = /未注明|未说明|未知/;
const known = (v: string | null | undefined): v is string =>
  !!v && v.trim() !== "" && !UNKNOWN.test(v);

const bw = (mbps: number) =>
  mbps >= 1000 ? `${mbps / 1000} Gbps（来源标注）` : `${mbps} Mbps（来源标注）`;

/** 公开测速参考（他人发布，本站只核对来源页面） */
export function publicRecordFields(record: TestRecord): FieldState[] {
  const r = record.data;
  const total = r.rows.length;
  const withLinks = r.rows.filter(x => x.evidenceUrl).length;
  const hasEvidence = withLinks > 0;

  const location: FieldState =
    !r.testLocation || r.testLocation === "未注明"
      ? { key: "location", label: "测试地点", status: "pending", value: null }
      : UNKNOWN.test(r.testLocation)
        ? {
            key: "location",
            label: "测试地点",
            status: "partial",
            value: r.testLocation,
          }
        : {
            key: "location",
            label: "测试地点",
            status: "ok",
            value: r.testLocation,
          };

  const date: FieldState = {
    key: "date",
    label: "测试日期",
    status: r.time || r.window ? "ok" : "partial",
    value: [r.recordedAt, r.time, r.window].filter(Boolean).join(" "),
    note: r.time || r.window ? undefined : "来源只写了日期，没有写具体时刻",
  };

  return [
    location,
    known(r.carrier)
      ? { key: "carrier", label: "运营商", status: "ok", value: r.carrier! }
      : { key: "carrier", label: "运营商", status: "pending", value: null },
    r.bandwidthMbps
      ? {
          key: "bandwidth",
          label: "宽带",
          status: "ok",
          value: bw(r.bandwidthMbps),
        }
      : { key: "bandwidth", label: "宽带", status: "pending", value: null },
    date,
    known(r.tool)
      ? { key: "tool", label: "测速工具", status: "ok", value: r.tool! }
      : { key: "tool", label: "测速工具", status: "pending", value: null },
    // 公开记录没有单独记录测速服务器；有 Speedtest 结果链接的，结果页上能看到
    hasEvidence
      ? {
          key: "server",
          label: "测速服务器",
          status: "partial",
          value: "本站未转录，可在 Speedtest 结果页核对",
        }
      : { key: "server", label: "测速服务器", status: "pending", value: null },
    withLinks === total && total > 0
      ? {
          key: "evidence",
          label: "原始结果",
          status: "ok",
          value: `${withLinks}/${total} 行附 Speedtest 结果链接`,
        }
      : hasEvidence
        ? {
            key: "evidence",
            label: "原始结果",
            status: "partial",
            value: `${withLinks}/${total} 行附 Speedtest 结果链接`,
            note: "其余行没有附原始结果",
          }
        : {
            key: "evidence",
            label: "原始结果",
            status: "pending",
            value: null,
            note: "没有原始截图或结果链接，只有来源页面上的表格",
          },
    {
      key: "source",
      label: "来源",
      status: "ok",
      value:
        r.sourceType === "vendor_claim"
          ? `${r.sourceName}（服务商自述，非独立测试）`
          : r.sourceName,
    },
  ];
}

/** 本站速度实测（站长自测，附原始截图） */
export function runFields(r: TestRun): FieldState[] {
  const publicFiles = r.evidenceFiles.filter(f => f.public).length;
  const evidenceCount = (r.evidenceUrl ? 1 : 0) + publicFiles;
  return [
    r.location
      ? { key: "location", label: "测试地点", status: "ok", value: r.location }
      : { key: "location", label: "测试地点", status: "pending", value: null },
    r.isp
      ? { key: "carrier", label: "运营商", status: "ok", value: r.isp }
      : { key: "carrier", label: "运营商", status: "pending", value: null },
    r.bandwidth
      ? { key: "bandwidth", label: "宽带", status: "ok", value: r.bandwidth }
      : { key: "bandwidth", label: "宽带", status: "pending", value: null },
    {
      key: "date",
      label: "测试日期",
      status: r.timeNote ? "partial" : "ok",
      value: runTime(r),
      note: r.timeNote ?? undefined,
    },
    {
      key: "tool",
      label: "测速工具",
      status: "ok",
      value: r.toolName ?? TOOL_LABEL[r.tool],
    },
    r.server
      ? { key: "server", label: "测速服务器", status: "ok", value: r.server }
      : { key: "server", label: "测速服务器", status: "pending", value: null },
    evidenceCount > 0
      ? {
          key: "evidence",
          label: "原始截图",
          status: "ok",
          value: `${evidenceCount} 份原始证据（${DATA_SOURCE_LABEL[r.dataSource]}）`,
        }
      : {
          key: "evidence",
          label: "原始截图",
          status: "pending",
          value: null,
          note: "原件存档未公开",
        },
    { key: "source", label: "来源", status: "ok", value: "本站站长自测" },
  ];
}

/** 节点在线状态核验：对照服务商面板截图，不是速度测试，所以地点、运营商、宽带、服务器不适用 */
export function nodeCheckFields(c: NodeCheck): FieldState[] {
  const na = (key: FieldState["key"], label: string): FieldState => ({
    key,
    label,
    status: "na",
    value: null,
  });
  return [
    na("location", "测试地点"),
    na("carrier", "运营商"),
    na("bandwidth", "宽带"),
    {
      key: "date",
      label: "检查日期",
      status: "ok",
      value: `${c.date} ${c.from}–${c.to}（北京时间）`,
    },
    {
      key: "tool",
      label: "检查方式",
      status: "ok",
      value: "服务商用户面板「节点状态」页（不是测速工具）",
    },
    na("server", "测速服务器"),
    c.evidence.length > 0
      ? {
          key: "evidence",
          label: "原始截图",
          status: "ok",
          value: `${c.evidence.length} 张面板截图`,
        }
      : { key: "evidence", label: "原始截图", status: "pending", value: null },
    { key: "source", label: "来源", status: "ok", value: c.source },
  ];
}

export function summarize(fields: FieldState[]) {
  const applicable = fields.filter(f => f.status !== "na");
  const ok = applicable.filter(f => f.status === "ok").length;
  const partial = applicable.filter(f => f.status === "partial");
  const pending = applicable.filter(f => f.status === "pending");
  return {
    ok,
    partial: partial.length,
    pending: pending.length,
    total: applicable.length,
    pendingLabels: pending.map(f => f.label),
    partialLabels: partial.map(f => f.label),
  };
}

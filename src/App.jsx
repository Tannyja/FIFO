import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function App() {
  const [csvData, setCsvData] = useState([]);
  const [frames, setFrames] = useState(3);
  const [result, setResult] = useState([]);

 
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result.trim();
      const arr = text
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !Number.isNaN(n));
      setCsvData(arr);
      setResult([]);
    };
    reader.readAsText(file);
  };

  // ส่วนของการคำนวน FIFO 
  const runFIFO = () => {
    if (!csvData.length) return; //เช็คว่ามีข้อมูลไฟล์ CSV ไหม
    //กำหนดตัวแปลพื้นฐาน
    const pages = csvData; // List ของค่าที่นำมาจำลอง
    const frameCount = frames; // จำนวนเฟรมที่เลือก
    let framesArr = Array(frameCount).fill(null); //สร้าง array ตามขนาดจำนวนเฟรม ใส่ค่า null ทุกช่อง
    let pointer = 0; // กำหนดตำแหน่ง pointer เพราะ FIFO ต้องรู้ว่าตัวไหนเข้าก่อนเพื่อแทนตัวนั้น pointer คือ index ที่จะถูกแทนในการเกิด Page Fault
    //Pointer จะเดินจาก 0-1-2 -> กลับไป 0
    let table = []; // ตัวแปรไว้เก็บผลทุก Step ใช้เก็บข้อมูลทุก Step (สำหรับทำตาราง Simulation,Grid)

    pages.forEach((page) => { //วนที่ละ Page เพื่อจำลอง FIFO โดยเอาเลขแต่ละตัวใน reference string มาคำนวณที่ละรอบ
      const before = [...framesArr]; //เก็บค่าสถานะก่อนเปลี่ยน (Copy เฟรมก่อนหน้า) (ใช้แสดง Step by Step) ให้เห็นว่ามีอะไรเปลี่ยนไป
      let isHit = framesArr.includes(page); //เช็คว่าเป็น HIT ไหม ถ้าPahe ที่จะใส่มีอยู่แล้วจะขึ้น HIT ถ้าไม่มีจะ Miss/Page Fault
      let replacedIndex = -1; //ตัวแปรรุบุตำแหน่งเฟรมที่ถูกแทน ใช้บอกว่ารอบนี้ไปแทนที่ช่องไหน (ถ้าเป็น MISS)

      if (!isHit) { //ถ้าเป็น MISS -> แทนค่า + ขยับ pointer                   //ถ้าไม่ใช่ HIT > ต้องเกิด Page Fault
        framesArr[pointer] = page; // ใส่ Page เข้าที่เฟรมที่ pointer ชี้อยู่.      //เอาค่า page ใส่ในเฟรมที่ Pointer ชี้อยู่
        replacedIndex = pointer; //บอกว่าช่องไหนถูกแทน                       //เก็บตำแหน่งที่ถูกแทน (ไว้ในกรอบสีชมพู)
        pointer = (pointer + 1) % frameCount; //ขยับ Pointer แบบวนลูป       //Pointer เดินไปช่องถัดไป 
      }                                                                   //ถ้าเกิดจำนวน Frame > กลับไปช่องแรก (โมดูลัส)

      table.push({   //เก็บผลลัพท์ของ Step นี้ลง Table
        page,  //ตัวเลขที่กำลังประมวลผล
        frames: [...framesArr], // Snapshot หลังเปลี่ยนแล้ว
        hit: isHit, // true/false
        replacedIndex, // ช่องไหนถูกแทน (เฉพาะ MISS)
        before, //สถานะก่อนเปลี่ยน
      });
    });

    setResult(table); // สุดท้าย อัพเดทผลลัพท์ทั้งหมด 
  };

  const totalSteps = result.length;
  const hits = result.filter((r) => r.hit).length;
  const faults = totalSteps - hits;
  const hitRate = totalSteps ? ((hits / totalSteps) * 100).toFixed(1) : 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        position: "relative",
        overflow: "hidden",
        bgcolor: "#050411",
        color: "#f8ecff",
        fontFamily: "Poppins, system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      {/* Aurora background blobs */}
      <Box
        sx={{
          position: "absolute",
          inset: -200,
          background:
            "radial-gradient(circle at 0% 0%, rgba(255,143,203,0.45), transparent 55%)," +
            "radial-gradient(circle at 100% 0%, rgba(126, 196, 255,0.4), transparent 60%)," +
            "radial-gradient(circle at 20% 100%, rgba(255, 208, 128,0.45), transparent 55%)," +
            "radial-gradient(circle at 100% 100%, rgba(129, 140, 248,0.55), transparent 55%)",
          opacity: 0.9,
          filter: "blur(45px)",
          zIndex: 0,
        }}
      />

      {/* Main content wrapper */}
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: 1400, mx: "auto" }}>
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            mb: 3,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                background:
                  "linear-gradient(90deg, #ff9fd8, #ffcba9, #7cd4ff, #b3a5ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800,
                letterSpacing: 0.4,
              }}
            >
              FIFO Page
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(235,230,255,0.7)",
              }}
            >
              CE333  MODERN OPERATING SYSTEM
            </Typography>
          </Box>

          <Chip
            label="FIFO"
            sx={{
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.35)",
              bgcolor: "rgba(10,10,25,0.6)",
              backdropFilter: "blur(18px)",
              color: "#ffe3ff",
              fontSize: 11,
              px: 1.4,
            }}
          />
        </Box>

        {/* CONTROL CARD */}
        <AuroraCard
          sx={{
            mb: 3,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                "0 28px 70px rgba(0,0,0,0.95), 0 0 0 1px rgba(244,114,182,0.6)",
            },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 0.3,
              color: "rgba(255,238,255,0.95)",
              textShadow: "0 0 18px rgba(255,180,255,0.45)",
              textAlign: "center",
            }}
          >
            Setup Frames
          </Typography>

          {/* 3 ช่องสมดุลกัน File / Frames / Simulation */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 1,
              width:"100%",
              alignItems: "center",
              justifyItems: "center",
            }}
          >
            {/* FILE */}
            <Box sx={{ textAlign: "center", maxWidth: 320, width: "100%" }}>
              <Typography
                sx={{ mb: 1, fontSize: 14, color: "rgba(211,201,255,0.85)" }}
              >
                เลือกไฟล์จ้า
              </Typography>

              <Button
                variant="contained"
                component="label"
                sx={{
                  width: "100%",
                  maxWidth: 220,
                  background:
                    "linear-gradient(135deg, #ff8bbb, #ff7db5, #ffae7b)",
                  borderRadius: "999px",
                  px: 3,
                  py: 1.1,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.36), 0 14px 32px rgba(65,3,45,0.55)",
                }}
              >
                เลือกไฟล์ CSV
                <input type="file" accept=".csv" hidden onChange={handleFile} />
              </Button>

              {csvData.length > 0 && (
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 12,
                    color: "rgba(225,235,255,0.9)",
                  }}
                >
                  โหลดแล้วจ้า {csvData.length} ค่า
                </Typography>
              )}
            </Box>

            {/* FRAMES */}
            <Box sx={{ textAlign: "center", maxWidth: 320, width: "100%" }}>
              <Typography
                sx={{ mb: 1, fontSize: 14, color: "rgba(211,201,255,0.85)" }}
              >
                เลือกจำนวน Frames เลยงับ
              </Typography>

              <Select
                value={frames}
                onChange={(e) => setFrames(e.target.value)}
                sx={{
                  width: "100%",
                  maxWidth: 220,
                  bgcolor: "rgba(9,12,32,0.9)",
                  borderRadius: "14px",
                  px: 1.5,
                  py: 0.5,
                  color: "#f8ecff",
                  fontSize: 13,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(211, 14, 106, 0.22)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.55)",
                  },
                  "& .MuiSelect-icon": {
                    color: "rgba(255,255,255,0.7)",
                  },
                }}
              >
                <MenuItem value={3}>3 Frames</MenuItem>
                <MenuItem value={4}>4 Frames</MenuItem>
                <MenuItem value={5}>5 Frames</MenuItem>
                <MenuItem value={6}>6 Frames</MenuItem>
                <MenuItem value={7}>7 Frames</MenuItem>
                <MenuItem value={8}>8 Frames</MenuItem>
              </Select>
            </Box>

            {/* BUTTON */}
            <Box sx={{ textAlign: "center", maxWidth: 320, width: "100%" }}>
              <Typography
                sx={{ mb: 1, fontSize: 16, color: "rgba(211,201,255,0.85)" }}
              >
                Simulation
              </Typography>

              <Button
                variant="contained"
                startIcon={<FavoriteIcon />}
                sx={{
                  width: "100%",
                  maxWidth: 220,
                  background:
                    "linear-gradient(135deg, #ff8bbb, #ff7db5, #ffae7b)",
                  borderRadius: "999px",
                  py: 1.1,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.28), 0 20px 40px rgba(55,3,35,0.85)",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    filter: "brightness(1.05)",
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.4), 0 25px 50px rgba(55,3,35,0.95)",
                  },
                }}
                onClick={runFIFO}
                disabled={!csvData.length}
              >
                Run FIFO
              </Button>
            </Box>
          </Box>
        </AuroraCard>

        {/* REFERENCE STRING */}
        {csvData.length > 0 && (
          <AuroraCard
            sx={{
              mb: 3,
              p: 3,
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow:
                  "0 24px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(96,165,250,0.6)",
              },
            }}
          >
            <Typography
              sx={{
                mb: 1.5,
                fontSize: 13,
                color: "rgba(202,227,255,0.9)",
              }}
            >
              Reference String
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.6,
                justifyContent: "center",
              }}
            >
              {csvData.map((page, idx) => (
                <Bubble key={idx} color="#7dd3ff">
                  {page}
                </Bubble>
              ))}
            </Box>
          </AuroraCard>
        )}

        {/* SIMULATION RESULT */}
        {result.length > 0 && (
          <>
            {/* SUMMARY */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ mb: 2, flexWrap: "wrap", justifyContent: "center" }}
            >
              <TagPill label={`Page Faults: ${faults}`} color="#ff7ab5" />
              <TagPill label={`Hits: ${hits}`} color="#4ade80" />
              <TagPill label={`Hit Rate: ${hitRate}%`} color="#7dd3ff" />
            </Stack>

            {/* GRID */}
            <AuroraCard
              sx={{
                mb: 3,
                overflowX: "auto",
                border: "1px solid rgba(255,144,212,0.6)",
                p: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Typography
                  sx={{
                    mb: 1.5,
                    fontSize: 13,
                    color: "rgba(255,220,255,0.9)",
                    textAlign: "center",
                  }}
                >
                  FIFO Simulation Grid (Frames × Steps)
                </Typography>

                <Typography
                  sx={{
                    mb: 2,
                    fontSize: 11,
                    color: "rgba(191,219,254,0.8)",
                    textAlign: "center",
                  }}
                >
                  แถว = Frame · คอลัมน์ = Step · ขอบชมพู = Page Fault · ขอบเขียว =
                  Hit
                </Typography>

                <Box sx={{ width: "100%", overflowX: "auto" }}>
                  <Box
                    sx={{
                      minWidth: result.length * 46,
                      mx: "auto",
                    }}
                  >
                    {/* Steps header */}
                    <Box
                      sx={{
                        display: "flex",
                        mb: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Box sx={{ width: 80 }} />
                      {result.map((_, step) => (
                        <Box
                          key={step}
                          sx={{
                            width: 40,
                            textAlign: "center",
                            fontSize: 11,
                            color: "rgba(203,213,255,0.8)",
                          }}
                        >
                          {step + 1}
                        </Box>
                      ))}
                    </Box>

                    {/* Frame rows */}
                    {Array.from({ length: frames }).map((_, fi) => (
                      <Box
                        key={fi}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            fontSize: 12,
                            color: "rgba(214,226,255,0.9)",
                          }}
                        >
                          Frame {fi + 1}
                        </Box>

                        {result.map((stepData, step) => {
                          const value = stepData.frames[fi];
                          const isMiss =
                            !stepData.hit && stepData.replacedIndex === fi;
                          const isHit =
                            stepData.hit && value === stepData.page;

                          return (
                            <GridCell
                              key={step}
                              value={value}
                              miss={isMiss}
                              hit={isHit}
                            />
                          );
                        })}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </AuroraCard>

            {/* DETAIL TABLE */}
            <AuroraCard
              sx={{
                p: 3,
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow:
                    "0 24px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(147,197,253,0.6)",
                },
              }}
            >
              <Typography
                sx={{
                  mb: 1.5,
                  fontSize: 13,
                  color: "rgba(202,227,255,0.9)",
                }}
              >
                Results — FIFO Steps Table
              </Typography>
              <Divider
                sx={{
                  borderColor: "rgba(148,163,255,0.35)",
                  mb: 1.5,
                }}
              />

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                <thead>
                  <tr>
                    <th style={thDark}>STEP</th>
                    <th style={thDark}>PAGE</th>
                    <th style={thDark}>FRAMES</th>
                    <th style={thDark}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((row, i) => (
                    <tr key={i}>
                      <td style={tdDark}>{i + 1}</td>
                      <td style={tdDark}>{row.page}</td>
                      <td style={tdDark}>
                        <Stack
                          direction="row"
                          spacing={0.7}
                          justifyContent="center"
                        >
                          {row.frames.map((f, idx) => (
                            <BubbleSmall key={idx} active={!!f}>
                              {f ?? ""}
                            </BubbleSmall>
                          ))}
                        </Stack>
                      </td>
                      <td style={tdDark}>
                        <Chip
                          size="small"
                          label={row.hit ? "HIT" : "FAULT"}
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            borderRadius: "999px",
                            px: 1.6,
                            bgcolor: row.hit
                              ? "rgba(22,163,74,0.12)"
                              : "rgba(248,113,164,0.13)",
                            color: row.hit ? "#4ade80" : "#fb7185",
                            border: row.hit
                              ? "1px solid rgba(34,197,94,0.85)"
                              : "1px solid rgba(248,113,164,0.9)",
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AuroraCard>
          </>
        )}
      </Box>
    </Box>
  );
}

/* ---------- Reusable Styled Bits ---------- */

function AuroraCard({ children, sx }) {
  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,0.22)",
        background:
          "linear-gradient(135deg, rgba(8,11,35,0.96), rgba(9,11,40,0.98))",
        boxShadow:
          "0 22px 55px rgba(3,4,15,0.95), 0 0 0 1px rgba(148,163,255,0.35)",
        backdropFilter: "blur(26px)",
        ...sx,
      }}
    >
      {/* subtle top highlight */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 0 0, rgba(255,255,255,0.14), transparent 60%)",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </Card>
  );
}

function Bubble({ children, color }) {
  return (
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: "#e5f3ff",
        background:
          "radial-gradient(circle at 30% 0, rgba(255,255,255,0.3), transparent 60%)",
        bgcolor: "rgba(8,11,37,0.9)",
        border: `1px solid ${color}`,
        boxShadow: `0 0 10px ${color}55`,
      }}
    >
      {children}
    </Box>
  );
}

function BubbleSmall({ children, active }) {
  return (
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        color: active ? "#e5e7ff" : "rgba(148,163,255,0.7)",
        bgcolor: active ? "rgba(12,19,48,0.95)" : "rgba(10,13,35,0.7)",
        border: active
          ? "1px solid rgba(148,163,255,0.95)"
          : "1px solid rgba(75,85,160,0.6)",
      }}
    >
      {children}
    </Box>
  );
}

function TagPill({ label, color }) {
  return (
    <Chip
      label={label}
      sx={{
        borderRadius: "999px",
        bgcolor: "rgba(9,11,36,0.9)",
        border: `1px solid ${color}`,
        color,
        fontSize: 12,
        px: 1.6,
      }}
    />
  );
}

function GridCell({ value, miss, hit }) {
  return (
    <Box
      sx={{
        width: 40,
        height: 32,
        mx: 0.35,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        background:
          "radial-gradient(circle at 30% 0, rgba(255,255,255,0.18), transparent 60%)",
        bgcolor: "rgba(7,10,34,0.9)",
        color: value ? "#fefbff" : "rgba(99,102,158,0.9)",
        border: miss
          ? "2px solid rgba(255,148,214,1)"
          : hit
          ? "2px solid rgba(74,222,128,1)"
          : "1px solid rgba(148,163,255,0.45)",
        boxShadow: miss
          ? "0 0 16px rgba(255,148,214,0.9)"
          : hit
          ? "0 0 14px rgba(74,222,128,0.9)"
          : "0 0 6px rgba(15,23,42,0.7)",
        transform: miss || hit ? "translateY(-2px)" : "",
        transition:
          "box-shadow 0.18s ease, transform 0.18s ease, background 0.18s ease",
      }}
    >
      {value ?? ""}
    </Box>
  );
}

const thDark = {
  padding: "8px 8px",
  textAlign: "center",
  color: "rgba(226,232,255,0.95)",
  borderBottom: "1px solid rgba(148,163,255,0.45)",
  fontWeight: 700,
  fontSize: 12,
};

const tdDark = {
  padding: "8px 8px",
  borderBottom: "1px solid rgba(30,41,82,0.9)",
  color: "rgba(226,232,255,0.94)",
  verticalAlign: "middle",
  fontSize: 12,
  textAlign: "center",
};
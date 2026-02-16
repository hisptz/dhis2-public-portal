import { motion } from "framer-motion"
import { RunStatus } from "./RunStatus"

const cycle = 0.5
const half = cycle / 2

export function StickMan({ status }: { status: RunStatus }) {
    const running = status === "RUNNING"
    const hasError = status === "ERRORED"
    const done = status === "DONE"

    const repeat = running || hasError
        ? { duration: cycle, repeat: Infinity, ease: "easeInOut" }
        : {}

    return (
        <div className="max-w-[18px]">
            <motion.svg width={22} height={22} viewBox="0 0 22 22">
                <motion.g
                    animate={running ? {
                        y: [0, -1.5, 0]
                    } : {}}
                    transition={repeat}
                >
                    <circle
                        cx="12"
                        cy={done ? "5.7" : "6"}
                        r="2"
                        fill="currentColor"
                    />

                    <motion.line
                        x1="11"
                        y1="7.5"
                        x2="11"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="square"
                        animate={running ? { rotate: 20 } : { rotate: 0 }}
                        style={{ transformOrigin: "11px 7.5px" }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.line
                        x1="12"
                        y1="7.5"
                        x2="12"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="square"
                        animate={{ rotate: 0 }}
                        style={{ transformOrigin: "11px 7.5px" }}
                        transition={{ duration: 0.2 }}
                    />

                    <motion.g
                        style={{ transformOrigin: "11px 8.5px" }}
                        animate={
                            running
                                ? { rotate: [55, -15, 55] }
                                : { rotate: -15 }
                        }
                        transition={{ ...repeat, delay: half }}
                    >
                        <line
                            x1="11"
                            y1="8.5"
                            x2="9"
                            y2="11.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </motion.g>

                    <motion.g
                        style={{ transformOrigin: "11px 8.5px" }}
                        animate={
                            running
                                ? { rotate: [55, -105, 55] }
                                : hasError ? { rotate: [75, 45, 75] } : { rotate: 15 }
                        }
                        transition={repeat}
                    >
                        <line
                            x1={hasError || done ? "13" : "12"}
                            y1={hasError ? "6.5" : "8.5"}
                            x2={done ? "15" : "14"}
                            y2="11.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </motion.g>

                    <motion.g
                        style={{ transformOrigin: "11px 12px" }}
                        animate={
                            running
                                ? { rotate: [-35, 55, -55] }
                                : { rotate: 10 }
                        }
                        transition={repeat}
                    >
                        <line
                            x1="11"
                            y1="12"
                            x2="11"
                            y2="17"
                            stroke="currentColor"
                            strokeWidth="2.3"
                            strokeLinecap="round"
                        />
                    </motion.g>

                    <motion.g
                        style={{ transformOrigin: "11px 12px" }}
                        animate={
                            running
                                ? { rotate: [-35, 25, -55] }
                                : { rotate: -10 }
                        }
                        transition={{ ...repeat, delay: half }}
                    >
                        <line
                            x1={hasError || done ? "13" : "12"}
                            y1="12"
                            x2={hasError || done ? "13" : "12"}
                            y2="17"
                            stroke="currentColor"
                            strokeWidth="2.3"
                            strokeLinecap="round"
                        />
                    </motion.g>
                </motion.g>
            </motion.svg>
        </div>
    )
}



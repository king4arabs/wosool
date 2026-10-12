"use client"

import Image from "next/image"
import { useLocale } from "@/lib/locale"
import styles from "./wosool-board.module.css"

const members = [
  { name: "Thamer Aldhafiri", nameAr: "ثامر الظفيري", company: "Cipher", description: "Cipher Company for Cybersecurity", website: "https://cipher.com.sa", linkedIn: "https://www.linkedin.com/in/thameraldhafiri", photo: null },
  { name: "Mohammed Alsolami", nameAr: "محمد السلمي", company: "RABEH", description: "Rabeh FinTech", website: "https://rabeh.sa", linkedIn: "https://www.linkedin.com/in/mohammedalsolami", photo: "/eoa/board/mohammed-alsolami-96.webp" },
  { name: "Anas Alsahali", nameAr: "أنس السهلي", company: "SEQUENCIVE", description: "SEQUENCIVE", website: "https://sequencive.com", linkedIn: null, photo: null },
  { name: "Faisal Almukles", nameAr: "فيصل المخلص", company: "Torood", description: "Torod Logistics", website: "https://torod.co", linkedIn: null, photo: null },
  { name: "Rayan Alzamil", nameAr: "ريان الزامل", company: "Salesfine", description: "SalesFine FinTech", website: "https://salesfine.co", linkedIn: null, photo: null },
  { name: "Majid Alrasheed", nameAr: "ماجد الرشيد", company: "Madkhool", description: "Madkhol Capital", website: "https://madkhool.sa", linkedIn: null, photo: null },
] as const

export function WosoolBoard() {
  const { locale } = useLocale()
  const ar = locale === "ar"

  return (
    <section id="wosool-board" className={styles.section} aria-labelledby="wosool-board-title" lang={locale} dir={ar ? "rtl" : "ltr"}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>{ar ? "أعضاء مجلس وصول · خريجو برنامج Multiverse" : "WOSOOL BOARD · MULTIVERSE GRADUATES"}</p>
        <h2 id="wosool-board-title">{ar ? "مجلس إدارة وصول" : "Wosool board members"}</h2>
        <p className={styles.intro}>{ar ? "مؤسسون جمعهم برنامج Multiverse، ويواصلون بناء مجتمع وصول من المؤسسين للمؤسسين." : "Multiverse alumni building a founders-to-founders community together."}</p>
        <div className={styles.list}>
          {members.map((member, index) => (
            <article className={styles.card} key={member.name}>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.portrait}>
                {member.photo ? (
                  <Image src={member.photo} alt={ar ? member.nameAr : member.name} width={96} height={96} sizes="64px" />
                ) : (
                  <span aria-label={ar ? `صورة ${member.nameAr} غير متاحة` : `Photo of ${member.name} unavailable`} role="img">{member.name.split(" ").map(part => part[0]).join("")}</span>
                )}
              </div>
              <div className={styles.details}>
                <h3>{ar ? member.nameAr : member.name}</h3>
                <p>{member.company} · {member.description}</p>
              </div>
              <div className={styles.links}>
                {member.website && <a href={member.website} target="_blank" rel="noopener noreferrer" aria-label={`${member.company} ${ar ? "موقع الشركة" : "website"}`}>{ar ? "موقع الشركة" : "Website"}</a>}
                {member.linkedIn && <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`}>LinkedIn</a>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

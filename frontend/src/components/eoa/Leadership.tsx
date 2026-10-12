'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Compass, Handshake, Users } from 'lucide-react'
import type { EoaProgram } from '@/lib/eoa'
import { leadershipBoard } from '@/lib/eoa-leadership'
import { EoaBoard } from './Board'
import { LamarkaProfile } from './LamarkaProfile'
import styles from './Leadership.module.css'

export function EoaLeadership({ program, ar }: { program: EoaProgram | null; ar: boolean }) {
  const board = leadershipBoard(program?.board_members)
  const roles = ar ? [
    ['EO الرياض', 'مجلس الإدارة', 'قيادة مجتمع الفرع ودعم المؤسسين وبناء العلاقات.'],
    ['محمد السلمي', 'قيادة المسرّعة', 'رئيس العضوية والمسرّعة؛ يقود برنامج EOA الرياض ورحلة نمو المشاركين.'],
    ['LAMARKA', 'الشريك المشغّل', 'خبرة في تصميم وتشغيل برامج ريادة الأعمال وبناء المشاريع.'],
  ] : [
    ['EO Riyadh', 'Chapter board', 'Chapter leadership, founder community and meaningful connections.'],
    ['Mohammed Alsolami', 'Accelerator leadership', 'Membership & Accelerator Chair, leading EOA Riyadh and its participants’ growth journey.'],
    ['LAMARKA', 'Operating partner', 'Experience designing and operating entrepreneurship programs and building ventures.'],
  ]
  const icons = [Users, Compass, Handshake]
  return <div className={styles.page}>
    <nav className={styles.jumpLinks} aria-label={ar ? 'أقسام القيادة' : 'Leadership sections'}>
      <a href="#program-lead">{ar ? 'قائد البرنامج' : 'Program lead'}</a>
      {board.length > 0 && <a href="#board">{ar ? 'مجلس الإدارة' : 'Board members'}</a>}
      <a href="#operator">{ar ? 'الشريك المشغّل' : 'Operating partner'}</a>
    </nav>
    <section className={styles.leader} id="program-lead" aria-labelledby="program-lead-title">
      <div className={styles.leaderPortrait}>
        <Image src="/eoa/board/mohammed-alsolami.webp" alt={ar ? 'محمد السلمي' : 'Mohammed Alsolami'} width={240} height={240} sizes="(max-width: 600px) 150px, 220px" />
        <span>{ar ? 'بقيادة المؤسسين' : 'FOUNDER LED'}</span>
      </div>
      <div>
        <span className={styles.eyebrow}>{ar ? 'قائد مسرّعة EO الرياض' : 'LEADING EO RIYADH ACCELERATOR'}</span>
        <h2 id="program-lead-title">{ar ? 'محمد السلمي' : 'Mohammed Alsolami'}</h2>
        <p className={styles.chair}>{ar ? 'رئيس العضوية والمسرّعة — EO الرياض' : 'EO Riyadh Membership & Accelerator Chair'}</p>
        <p>{ar ? 'يقود محمد السلمي مسرّعة EO الرياض لدعم نمو المؤسسين وشركاتهم.' : 'Mohammed Alsolami leads EO Riyadh Accelerator, supporting founders and their companies as they grow.'}</p>
        <div className={styles.actions}>
          <Link href="/eoa/contact">{ar ? 'تواصل مع فريق البرنامج' : 'Connect with the program team'} <ArrowUpRight size={18} aria-hidden="true" /></Link>
          <a href="https://www.linkedin.com/in/mohammedalsolami" target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
    <section className={styles.roles} aria-label={ar ? 'قيادة وتشغيل البرنامج' : 'Program leadership and operations'}>
      {roles.map(([name, role, detail], index) => {
        const Icon = icons[index]
        return <article key={name}><Icon size={26} aria-hidden="true" /><span className={styles.eyebrow}>{role}</span><h3>{name}</h3><p>{detail}</p></article>
      })}
    </section>
    <EoaBoard members={board} ar={ar} layout="grid" />
    <LamarkaProfile ar={ar} />
    <section className={styles.nextStep}>
      <div><h2>{ar ? 'تعرّف على رحلة نموّك القادمة' : 'Explore your next stage of growth'}</h2><p>{ar ? 'تعرّف على البرنامج ومعايير المشاركة، أو تواصل مع الفريق لمناقشة مساهمتك في مجتمع المؤسسين.' : 'Explore the program and participation criteria, or speak with the team about contributing to the founder community.'}</p></div>
      <Link href="/eoa/program">{ar ? 'استكشف البرنامج' : 'Explore the program'} <ArrowUpRight size={20} aria-hidden="true" /></Link>
    </section>
  </div>
}

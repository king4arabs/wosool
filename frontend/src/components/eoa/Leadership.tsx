'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { EoaProgram } from '@/lib/eoa'
import { leadershipBoard } from '@/lib/eoa-leadership'
import { EoaBoard } from './Board'
import { LamarkaProfile } from './LamarkaProfile'
import styles from './Leadership.module.css'

const programLeaders = [
  {
    id: 'mohammed-alsolami',
    name: ['محمد السلمي', 'Mohammed Alsolami'],
    role: ['قائد البرنامج', 'Program Lead'],
    detail: ['رئيس العضوية والمسرّعة — EO الرياض', 'EO Riyadh Membership & Accelerator Chair'],
    image: '/wosool/board/mohammed-alsolami.webp',
    imageSize: 512,
    links: [
      { href: '/eoa/contact', label: ['تواصل مع الفريق', 'Contact the team'] },
      { href: 'https://www.linkedin.com/in/mohammedalsolami', label: ['LinkedIn', 'LinkedIn'] },
    ],
  },
  {
    id: 'fouad-alnazawi',
    name: ['فؤاد النزّاوي', 'Fouad Alnazawi'],
    role: ['شريك تشغيل البرنامج', 'Program Operation Partner'],
    detail: ['لاماركا', 'LAMARKA'],
    image: '/wosool/leadership/fouad-alnazawi.png',
    imageSize: 200,
    links: [
      { href: 'https://www.lamarka.com/', label: ['لاماركا', 'LAMARKA'] },
      { href: 'https://me.sh/profile/fouad-alnazawi', label: ['الملف المهني', 'View profile'] },
    ],
  },
  {
    id: 'bashaier-abdullah',
    name: ['بشاير عبدالله', 'Bashaier Abdullah'],
    role: ['قائدة مكتب إدارة مشاريع مسرّعة EO الرياض', 'EOA Riyadh PMO Leader'],
    detail: ['مديرة فرع EO الرياض', 'EO Riyadh Chapter Manager'],
    image: '/wosool/leadership/bashaier-abdullah.png',
    imageSize: 447,
    links: [
      { href: '/eoa/contact', label: ['تواصل مع الفريق', 'Contact the team'] },
      { href: 'https://sa.linkedin.com/in/bashaier-abdullah-685190283', label: ['LinkedIn', 'LinkedIn'] },
    ],
  },
]

export function EoaLeadership({ program, ar }: { program: EoaProgram | null; ar: boolean }) {
  const board = leadershipBoard(program?.board_members)
  const language = ar ? 0 : 1
  return <div className={styles.page}>
    <nav className={styles.jumpLinks} aria-label={ar ? 'أقسام القيادة' : 'Leadership sections'}>
      <a href="#program-lead">{ar ? 'قائد البرنامج' : 'Program lead'}</a>
      {board.length > 0 && <a href="#board">{ar ? 'مجلس الإدارة' : 'Board members'}</a>}
      <a href="#operator">{ar ? 'الشريك المشغّل' : 'Operating partner'}</a>
    </nav>
    <section id="program-lead" aria-label={ar ? 'فريق قيادة البرنامج' : 'Program leadership team'}>
      <div className={styles.leaders} data-program-leaders>
        {programLeaders.map(leader => <article className={styles.leader} key={leader.id} aria-labelledby={`${leader.id}-name`}>
          <div className={styles.leaderPortrait}>
            <Image src={leader.image} alt={leader.id === 'bashaier-abdullah' ? (ar ? 'شعار بشاير عبدالله' : 'Bashaier Abdullah monogram') : leader.name[language]} width={leader.imageSize} height={leader.imageSize} sizes="160px" />
          </div>
          <p className={styles.leaderRole}>{leader.role[language]}</p>
          <h2 id={`${leader.id}-name`}><bdi>{leader.name[language]}</bdi></h2>
          <p className={styles.chair}>{leader.detail[language]}</p>
          <div className={styles.actions}>
            {leader.links.map(link => link.href.startsWith('/')
              ? <Link href={link.href} key={link.href}>{link.label[language]} <ArrowUpRight size={16} aria-hidden="true" /></Link>
              : <a href={link.href} key={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.label[language]} — ${leader.name[language]}${ar ? ' (نافذة جديدة)' : ' (opens in a new tab)'}`}>{link.label[language]} <ArrowUpRight size={16} aria-hidden="true" /></a>)}
          </div>
        </article>)}
      </div>
    </section>
    <EoaBoard members={board} ar={ar} layout="grid" />
    <LamarkaProfile ar={ar} />
    <section className={styles.nextStep}>
      <div><h2>{ar ? 'تعرّف على رحلة نموّك القادمة' : 'Explore your next stage of growth'}</h2><p>{ar ? 'تعرّف على البرنامج ومعايير المشاركة، أو تواصل مع الفريق لمناقشة مساهمتك في مجتمع المؤسسين.' : 'Explore the program and participation criteria, or speak with the team about contributing to the founder community.'}</p></div>
      <Link href="/eoa/program">{ar ? 'استكشف البرنامج' : 'Explore the program'} <ArrowUpRight size={20} aria-hidden="true" /></Link>
    </section>
  </div>
}

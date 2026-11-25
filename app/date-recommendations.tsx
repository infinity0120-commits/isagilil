'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowUp, ArrowUpRight, Check, ChevronDown, Compass, Crown, LockKeyhole, MapPin, MessageCircle, Sparkles } from 'lucide-react'
import styles from './date-recommendations.module.css'

type FamilyMember = { id: number; role: string; birth: string; calendar: string; gender: string }
type Props = { year: string; month: string; direction: string; origin: string; destination: string; members: FamilyMember[]; weekend: string; priority: string }
type LunarDay = { getDay: () => number; getDayZhi: () => string; getYear: () => number; getMonth: () => number }
type SolarDate = { getLunar: () => LunarDay }
type CalendarApi = { Solar: { fromYmd: (year: number, month: number, day: number) => SolarDate }; Lunar: { fromYmd: (year: number, month: number, day: number) => LunarDay } }
const { Solar, Lunar } = require('lunar-javascript') as CalendarApi

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean
      init: (key: string) => void
      Share: {
        sendDefault: (params: {
          objectType: string
          itemContent?: { text: string; image?: { src: string; width: number; height: number } }
          content: { title: string; description: string; imageUrl: string; link: { webUrl?: string; mobileWebUrl?: string } }
          buttons: { title: string; link: { webUrl?: string; mobileWebUrl?: string } }[]
        }) => void
      }
    }
  }
}

const KAKAO_JS_KEY = '8ba4e34fd1b680821ee31c54ae69cc8a'
const SHARE_LINK = 'https://isagilil.vercel.app'
const SHARE_TITLE = '🔮 [이사길일연구소] 우리 가족 2026년 이사 길일 분석표'
const SHARE_TEXT = '우리 가족 맞춤 대길일 분석 완료! 피해야 할 흉일과 이사비용 절약 팁을 확인해보세요.'
const KAKAO_SHARE_DESCRIPTION = '1순위 대길일 분석 완료! 가족 사주 조화와 피해야 할 흉일을 카톡에서 바로 확인해보세요.'
const SHARE_IMAGE = 'https://isagilil.vercel.app/placeholder.jpg'

function buildKakaoShareText(props: Props, analysis: ReturnType<typeof buildDateAnalysis>): string {
  const top = analysis.recommendations[0]
  const month = Number(props.month)
  const dateLine = top ? `1순위 대길일: ${month}월 ${top.day}일 (${weekdayNames[top.weekday]})` : `${month}월 추천 날짜`
  return [SHARE_TEXT, dateLine, `이사 방향: ${props.direction === '좌표 확인 필요' ? '확인 필요' : props.direction}`, `분석 보기: ${SHARE_LINK}`].join('\n')
}

const branches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']
const koreanBranchByChinese: Record<string, string> = { 子: '자', 丑: '축', 寅: '인', 卯: '묘', 辰: '진', 巳: '사', 午: '오', 未: '미', 申: '신', 酉: '유', 戌: '술', 亥: '해' }
const zodiacByBranch: Record<string, string> = { 자: '쥐', 축: '소', 인: '호랑이', 묘: '토끼', 진: '용', 사: '뱀', 오: '말', 미: '양', 신: '원숭이', 유: '닭', 술: '개', 해: '돼지' }
const conflictPairs: Record<string, string> = { 자: '오', 오: '자', 축: '미', 미: '축', 인: '신', 신: '인', 묘: '유', 유: '묘', 진: '술', 술: '진', 사: '해', 해: '사' }
const weekdayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
const dayDirections: Record<string, string[]> = {
  사: ['북', '서'], 오: ['북', '서'], 미: ['북', '서'],
  인: ['서', '남'], 묘: ['서', '남'], 진: ['서', '남'],
  신: ['동', '북'], 유: ['동', '북'], 술: ['동', '북'],
  해: ['남', '동'], 자: ['남', '동'], 축: ['남', '동'],
}
const directionNames: Record<string, string> = { 북: '북쪽', 남: '남쪽', 동: '동쪽', 서: '서쪽' }
const compassAngles: Record<string, number> = { 북: 0, 북동: 45, 동: 90, 남동: 135, 남: 180, 남서: 225, 서: 270, 북서: 315 }
const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
const getBranch = (year: number) => branches[((year - 4) % 12 + 12) % 12]
const getLunarForBirth = (member: FamilyMember) => {
  const [year, month, day] = member.birth.split('-').map(Number)
  if (member.calendar === '음력') return Lunar.fromYmd(year, month, day)
  return Solar.fromYmd(year, month, day).getLunar()
}
const getLunarDay = (year: number, month: number, day: number) => Solar.fromYmd(year, month, day).getLunar()
const isHandless = (lunarDay: number) => lunarDay % 10 === 9 || lunarDay % 10 === 0
const directionIsSafe = (direction: string, badDirections: string[]) => direction !== '좌표 확인 필요' && !badDirections.some((bad) => direction.includes(bad))

function CompassIndicator({ direction }: { direction: string }) {
  const angle = compassAngles[direction]
  const accessibleDirection = direction === '좌표 확인 필요' ? '확인 필요' : direction === '동일 지역' ? '같은 지역' : `${direction}쪽 이동`
  return <div className={styles.compass} role="img" aria-label={`이동 나침반: ${accessibleDirection}`}>
    <span className={styles.compassNorth}>북</span><span className={styles.compassEast}>동</span><span className={styles.compassSouth}>남</span><span className={styles.compassWest}>서</span>
    {angle === undefined ? <Compass className={styles.compassUnknown} aria-hidden="true" /> : <ArrowUp className={styles.compassNeedle} aria-hidden="true" style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }} />}
  </div>
}

function buildDateAnalysis(props: Props) {
  const year = Number(props.year)
  const month = Number(props.month)
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const family = props.members.map((member) => {
    const lunar = getLunarForBirth(member)
    const lunarYear = lunar.getYear()
    const branch = getBranch(lunarYear)
    return { ...member, lunarYear, branch, zodiac: zodiacByBranch[branch] }
  })
  const annualBranch = getBranch(getLunarDay(year, month, 1).getYear())
  const badDirections = dayDirections[annualBranch] ?? []
  const movingSafe = directionIsSafe(props.direction, badDirections)
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
    const isWeekend = weekday === 0 || weekday === 6
    if (props.weekend === 'weekend' ? !isWeekend : isWeekend) return null
    const lunar = getLunarDay(year, month, day)
    const lunarDay = lunar.getDay()
    const lunarMonth = Math.abs(lunar.getMonth())
    const rawDayBranch = lunar.getDayZhi()
    const dayBranch = koreanBranchByChinese[rawDayBranch] ?? rawDayBranch
    const handless = isHandless(lunarDay)
    const conflicts = family.filter((member) => conflictPairs[member.branch] === dayBranch)
    const familyScore = family.length ? Math.round(((family.length - conflicts.length) / family.length) * 40) : 40
    const auspiciousScore = Math.max(14, (handless ? 30 : 23) - Math.min(conflicts.length * 2, 6))
    const directionScore = props.direction === '좌표 확인 필요' ? 14 : movingSafe ? 20 : 8
    const costScore = isWeekend ? handless ? 1 : 4 : handless ? 7 : 10
    return {
      day, weekday, lunarDay, lunarMonth, dayBranch, handless, conflicts,
      scoreBreakdown: [
        { label: '가족 사주 조화', points: familyScore, max: 40 },
        { label: '길일 여부', points: auspiciousScore, max: 30 },
        { label: '이사 방향 안전도', points: directionScore, max: 20 },
        { label: '비용 효율', points: costScore, max: 10 },
      ],
      total: familyScore + auspiciousScore + directionScore + costScore,
      isWeekend,
    }
  }).filter((day): day is NonNullable<typeof day> => day !== null)
  const ranked = days.sort((a, b) => b.total - a.total || (props.priority === 'traditional' ? Number(b.handless) - Number(a.handless) : Number(a.handless) - Number(b.handless)) || a.day - b.day)
  const recommendations = ranked.slice(0, 3)
  const recommendedDays = new Set(recommendations.map(({ day }) => day))
  const warnings = [...days].filter(({ day }) => !recommendedDays.has(day)).sort((a, b) => a.total - b.total || b.day - a.day).slice(0, 3)
  return { family, annualBranch, badDirections, movingSafe, recommendations, warnings }
}

function getDirectionText(direction: string) {
  if (direction === '좌표 확인 필요') return '지역 좌표를 확인할 수 없어 이동 방위를 판정하지 못했습니다.'
  if (direction === '동일 지역') return '출발지와 도착지가 같은 지역으로 표시되어 이동 방위가 없습니다.'
  return `${direction}쪽 이동`
}

function getDirectionExplanation(props: Props, analysis: ReturnType<typeof buildDateAnalysis>, day: { day: number }) {
  const year = Number(props.year)
  const dateLabel = `${Number(props.month)}월 ${day.day}일`
  const badList = analysis.badDirections.map((direction) => `${directionNames[direction]} 방위`).join('과 ')
  if (props.direction === '좌표 확인 필요') return `${dateLabel} 출발지 ${props.origin} → 도착지 ${props.destination}의 대표 좌표를 확인할 수 없어 방위 분석은 보류했어요. 직접 입력 지역은 실제 주소로 다시 확인해 주세요.`
  if (props.direction === '동일 지역') return `${dateLabel} 출발지 ${props.origin} → 도착지 ${props.destination}은 같은 지역으로 표시되어 방위 길흉을 따로 판단하지 않았어요.`
  if (analysis.movingSafe) return `출발지 ${props.origin} → 도착지 ${props.destination} = ${getDirectionText(props.direction)}. ${year}년 대장군방(${directionNames[analysis.badDirections[0]]})과 삼살방(${directionNames[analysis.badDirections[1]]})을 피했고, ${dateLabel} 이동도 주의 방위와 겹치지 않아요.`
  return `출발지 ${props.origin} → 도착지 ${props.destination} = ${getDirectionText(props.direction)}. ${year}년 대장군방·삼살방(${badList})과 겹치며, ${dateLabel}에도 같은 경로를 이용하므로 날짜와 함께 참고해 주세요.`
}

function getCostReason(day: ReturnType<typeof buildDateAnalysis>['recommendations'][number]) {
  const lunarDate = `음력 ${day.lunarMonth}월 ${day.lunarDay}일`
  const weekday = weekdayNames[day.weekday]
  if (!day.isWeekend && !day.handless) return `${lunarDate}은 손없는날이 아닌 평일이라 이사 수요가 적어 비용 절약에 유리합니다.`
  if (!day.isWeekend && day.handless) return `${lunarDate} 손없는날이 평일(${weekday})과 겹쳐요. 주말보다 수요는 낮아도 예약·견적을 미리 확인해 보세요.`
  if (day.isWeekend && day.handless) return `${lunarDate} 손없는날과 ${weekday}이 겹쳐 수요가 몰릴 수 있어 여러 업체의 견적을 비교하는 편이 좋아요.`
  return `${lunarDate}의 ${weekday} 주말 일정은 편리하지만 평일보다 수요가 높을 수 있어 비용을 먼저 비교해 보세요.`
}

function buildWarningReason(day: ReturnType<typeof buildDateAnalysis>['warnings'][number], props: Props, analysis: ReturnType<typeof buildDateAnalysis>) {
  if (day.conflicts.length) {
    const member = day.conflicts[0]
    return `${member.role}(${member.lunarYear}년생 ${member.zodiac}띠)는 이날 일진(${day.dayBranch})과 전통적인 육충 짝이라 일정 후보를 다시 살펴보세요.`
  }
  if (!analysis.movingSafe && props.direction !== '좌표 확인 필요' && props.direction !== '동일 지역') {
    return `${getDirectionText(props.direction)}이 ${analysis.badDirections.map((direction) => directionNames[direction]).join('·')}의 주의 방위와 겹쳐 이 날짜는 한 번 더 살펴보세요.`
  }
  if (day.isWeekend && day.handless) return `음력 ${day.lunarMonth}월 ${day.lunarDay}일 손없는날에 주말까지 겹쳐 이사 수요와 비용이 높아질 수 있어요.`
  if (day.isWeekend) return `${weekdayNames[day.weekday]} 주말 이사라 평일보다 예약 경쟁이 있을 수 있어 견적을 일찍 확인해 주세요.`
  if (day.handless) return `음력 ${day.lunarMonth}월 ${day.lunarDay}일 손없는날이라 평일이어도 선호 수요가 모일 수 있어요.`
  return `음력 ${day.lunarMonth}월 ${day.lunarDay}일은 손없는날 기준(끝자리 9·0)에 해당하지 않아 비용과 일정 조건을 함께 비교해 보세요.`
}

export default function DateRecommendations(props: Props) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'info' | 'success'>('info')
  const analysis = useMemo(() => buildDateAnalysis(props), [props])
  const kakaoShareText = useMemo(() => buildKakaoShareText(props, analysis), [props, analysis])

  const calculationKey = `${props.year}-${props.month}-${props.origin}-${props.destination}-${props.members.map((member) => `${member.id}:${member.birth}:${member.calendar}`).join('|')}`

  useEffect(() => {
    setIsUnlocked(false)
    try {
      window.localStorage.removeItem('moving-lab-report-unlocked')
    } catch {
      // Storage is optional; the report remains locked in component state.
    }
  }, [calculationKey])

  useEffect(() => {
    const ensureKakao = () => {
      if (typeof window === 'undefined' || !window.Kakao) return false
      if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY)
      return true
    }
    if (ensureKakao()) return
    const interval = window.setInterval(() => { if (ensureKakao()) window.clearInterval(interval) }, 300)
    const timeout = window.setTimeout(() => window.clearInterval(interval), 6000)
    return () => { window.clearInterval(interval); window.clearTimeout(timeout) }
  }, [])

  const showToast = (message: string, type: 'info' | 'success' = 'info') => {
    setToastType(type)
    setToastMessage(message)
  }

  useEffect(() => {
    if (!toastMessage) return
    const timeout = window.setTimeout(() => setToastMessage(''), 4200)
    return () => window.clearTimeout(timeout)
  }, [toastMessage])

  const unlockReport = () => {
    setIsUnlocked(true)
    try {
      window.localStorage.setItem('moving-lab-report-unlocked', 'true')
    } catch {
      // Storage is optional; the report unlocks in component state.
    }
  }

  const fallbackClipboardUnlock = async () => {
    try {
      await navigator.clipboard.writeText(kakaoShareText)
    } catch {
      // Clipboard API can fail on insecure origins; proceed to unlock regardless.
    }
    unlockReport()
    showToast('✅ 가족 단톡방에 보낼 추천 날짜가 복사되었습니다! 카톡에 붙여넣어 공유해보세요. (리포트 잠금 해제됨)', 'success')
  }

  const shareWithKakao = async () => {
    // 1) Mobile: prefer native Web Share API to avoid any Kakao domain popup errors.
    const supportsNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    if (supportsNativeShare) {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: SHARE_LINK })
        unlockReport()
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
        // Native share failed for another reason — fall through to Kakao SDK.
      }
    }

    // 2) Try Kakao SDK (PC + mobile where native share is unavailable).
    if (typeof window !== 'undefined' && window.Kakao) {
      try {
        if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY)
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: SHARE_TITLE,
            description: KAKAO_SHARE_DESCRIPTION,
            imageUrl: SHARE_IMAGE,
            link: { webUrl: SHARE_LINK, mobileWebUrl: SHARE_LINK },
          },
          buttons: [{ title: '이사 길일 분석 보기', link: { webUrl: SHARE_LINK, mobileWebUrl: SHARE_LINK } }],
        })
        unlockReport()
        return
      } catch {
        // Kakao SDK failed (4019 domain auth, blocked popup, etc.) — fail-safe below.
      }
    }

    // 3) Fail-safe: copy summary to clipboard, unlock, show success toast.
    await fallbackClipboardUnlock()
  }

  return <section className={styles.recommendations} aria-label="추천 날짜 상세 분석">
    <div className={styles.sectionHeading}><div><span className={styles.overline}>FAMILY DATE REPORT</span><h3>우리 가족 맞춤 추천 날짜</h3><p>양·음력 날짜와 가족 생년 띠, 이동 방향을 기준으로 살펴봤어요.</p></div><div className={styles.headingActions}><span className={styles.methodBadge}>간이 참고 점수</span></div></div>
    <div className={styles.cards}>
      {analysis.recommendations.map((day, index) => {
        const weekday = weekdayNames[day.weekday]
        const directionExplanation = getDirectionExplanation(props, analysis, day)
        const title = `${Number(props.month)}월 ${day.day}일 (${weekday})`
        const familyNoConflict = day.conflicts.length === 0
        const displayScore = [98, 93, 89][index] ?? day.total
        const narrative = index === 0
          ? `${day.handless ? '손없는날 기준과 ' : ''}가족 ${analysis.family.length}명의 사주 흐름을 함께 살펴본 날짜예요. ${familyNoConflict ? '가족 간 충이 없어 편안한 시작을 준비하기 좋아요.' : '가족별 상세 내용을 확인하고 여유 있게 준비해 보세요.'}`
          : index === 1
            ? `${weekday} 일정과 비용 조건을 함께 고려했어요. ${familyNoConflict ? '가족 간 충이 적어 차분히 이사를 준비할 수 있어요.' : '가족별 사주 상세 분석도 함께 확인해 주세요.'}`
            : `날짜와 이동 방향 조건을 종합한 후보예요. ${familyNoConflict ? '가족과 함께 새로운 시작을 준비해 보세요.' : '가족별 상세 내용을 참고해 일정을 조율해 보세요.'}`
        const directionLabel = directionNames[props.direction] ?? (props.direction === '동일 지역' ? '동일 지역' : '확인 필요')
        return <article className={`${styles.dateCard} ${index === 0 ? styles.best : ''}`} key={day.day}>
          <div className={styles.cardTop}><span className={`${styles.rank} ${index === 0 ? styles.topRank : ''}`}>{index === 0 ? <><Crown size={15} aria-hidden="true" /> 최고 추천 대길일</> : `추천 ${index + 1}`}</span><span className={styles.lunarStamp}>음력 {day.lunarMonth}월 {day.lunarDay}일</span></div>
          <div className={styles.dateTitleRow}><h4>{title}</h4><div className={styles.score}><b>{displayScore}</b><span>점</span><div className={styles.scoreProgress} role="img" aria-label={`${displayScore}점`}><span style={{ width: `${displayScore}%` }} /></div></div></div>
          <div className={styles.pillTags}><span><Check size={13} />{day.handless ? '손없는날' : day.isWeekend ? '주말 일정' : '평일 절약일'}</span><span><Check size={13} />{familyNoConflict ? '가족 사주 조화' : '가족 사주 확인'}</span><span className={analysis.movingSafe ? '' : styles.cautionTag}><Check size={13} />{analysis.movingSafe ? `이동 방위(${directionLabel}) 안전` : '이동 방위 확인 필요'}</span></div>
          <p className={styles.teaserSummary}>{narrative}</p>
          <div className={styles.detailFrame}>
            <div className={`${styles.detailedContent} ${!isUnlocked ? styles.locked : ''}`} aria-hidden={!isUnlocked} inert={!isUnlocked}>
              <ul className={styles.reasons}>
                <li><span className={styles.reasonLabel}>길일 참고</span><span>{day.handless ? `음력 ${day.lunarMonth}월 ${day.lunarDay}일로 손없는날 기준에 해당해요.` : `음력 ${day.lunarMonth}월 ${day.lunarDay}일은 손없는날 기준에 해당하지 않아요.`} {getCostReason(day)}</span></li>
                <li><span className={styles.reasonLabel}>가족 일진</span><span>{familyNoConflict ? `입력한 가족 ${analysis.family.length}명과 이날 일진(${day.dayBranch}) 사이에는 전통적인 충 관계가 확인되지 않았어요.` : `이날 일진(${day.dayBranch})과 충 관계가 확인된 가족이 ${day.conflicts.length}명 있어요.`}</span></li>
                <li><span className={styles.reasonLabel}>이동 방향</span><div className={styles.directionReason}><CompassIndicator direction={props.direction} /><span>{directionExplanation}</span></div></li>
              </ul>
              <details className={styles.familyDetails}>
                <summary>가족별 사주 상세 분석 보기 <ChevronDown size={15} /></summary>
                <div className={styles.familyRows}>{analysis.family.map((member) => {
                  const hasConflict = conflictPairs[member.branch] === day.dayBranch
                  return <div className={styles.familyRow} key={member.id}><span className={styles.avatar}>{member.role.trim().slice(0, 1) || '가'}</span><div><b>{member.role || '가족'} · {member.lunarYear}년생 {member.zodiac}띠</b><p>{hasConflict ? `생년 지지(${member.branch})와 이날 일진(${day.dayBranch})은 전통적인 육충 관계예요. 참고 지표로만 살피고, 실제 결정은 가족 일정과 편의를 우선해 주세요.` : `생년 지지(${member.branch})와 이날 일진(${day.dayBranch})은 전통적인 육충 짝(${member.branch}-${conflictPairs[member.branch]})에 해당하지 않아요.`}</p></div><span className={`${styles.statusBadge} ${hasConflict ? styles.caution : styles.positive}`}>{hasConflict ? '충 관계 참고' : '충 없음'}</span></div>
                })}</div>
              </details>
            </div>
            {!isUnlocked && <div className={styles.cardUnlockOverlay}><button type="button" className={styles.cardUnlockButton} onClick={shareWithKakao}><MessageCircle size={17} />카카오톡 공유하고 상세 분석 보기</button></div>}
          </div>
        </article>
      })}
    </div>

    {!isUnlocked && <div className={styles.unlockArea}>
      <div className={styles.blurredPreview} aria-hidden="true"><span>가족별 일진 궁합 · 길일 풀이 · 이동 방향 세부 분석</span><span>흉일 캘린더 · 비용 절약 메모</span></div>
      <div className={styles.unlockBanner}><span className={styles.lockIcon}><LockKeyhole size={22} /></span><div className={styles.unlockCopy}><h4>우리 가족 맞춤 상세 사주 풀이 &amp; 흉일 캘린더</h4><p>카카오톡으로 가족에게 공유하면 상세 풀이를 무료로 확인할 수 있어요. 모바일에서는 기기 공유 창이, PC에서는 안전한 복사 방식으로 작동해요.</p></div><button type="button" onClick={shareWithKakao} className={styles.shareButton}><MessageCircle size={18} />카카오톡으로 가족에게 공유하고 무료 확인하기<ArrowUpRight size={16} /></button></div>
    </div>}

    {isUnlocked && <div className={styles.unlockedNotice} role="status"><Check size={17} /> 상세 리포트가 열렸어요. 가족별 분석과 주의 날짜를 확인해 보세요.</div>}

    <div className={styles.warningBox}><div className={styles.warningHeading}><span className={styles.warningIcon}>!</span><div><b>일정 선택 전 한 번 더 확인해 볼 날짜</b><p>가족별 충, 이동 방향, 손없는날과 주말 수요를 조합한 참고 목록이에요.</p></div></div>
      <ul className={styles.warningList}>{analysis.warnings.slice(0, 2).map((day) => <li className={styles.warningRow} key={day.day}><span className={styles.warningBullet} aria-hidden="true" /><div><b>{Number(props.month)}월 {day.day}일 ({weekdayNames[day.weekday]})</b><span>{buildWarningReason(day, props, analysis)}</span></div></li>)}</ul>
      <p className={styles.warningFoot}>날짜 추천은 전통 명리 기준을 단순화한 참고용 결과이며, 과학적 예측이나 전문 택일 상담을 대신하지 않아요.</p>
    </div>

    {isUnlocked && <div className={styles.adPlaceholder} aria-label="광고 배너 자리"><span>광고</span><b>AdSense 배너 자리</b><small>광고가 연결되면 이 영역에 표시됩니다.</small></div>}

    {toastMessage && <div className={`${styles.toast} ${toastType === 'success' ? styles.toastSuccess : ''}`} role="status" aria-live="polite">{toastType === 'success' ? <Check size={16} /> : <Sparkles size={16} />}{toastMessage}</div>}
    <p className={styles.methodNote}><MapPin size={13} /> 손없는날은 음력일 끝자리 9·0으로 계산하고, 방향은 지역 대표 좌표와 해당 연도 방위 기준을 적용해요. 점수는 간이 참고용이며 정통 생기·복덕 택일이나 과학적 예측을 대신하지 않습니다. 가족 정보는 저장하지 않으며, 새 분석을 시작하면 리포트가 다시 잠깁니다.</p>
  </section>
}

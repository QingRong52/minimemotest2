
import React from 'react';

interface LuluProps {
  className?: string;
  size?: number;
}

/**
 * 萝萝山【13.0 极简稳重版】规范：
 * 1. 身体：极轻微左右摆动 (Sway) 和 呼吸起伏，不再有剧烈位移。
 * 2. 叶子：深度嵌套在身体组内，保证动作绝对同步且不丢失。
 * 3. 细节：去除了所有可能产生视觉干扰的杂色线条（如之前的蓝色背带绳）。
 */

const Animations = () => (
  <style>{`
    @keyframes lulu-natural-sway {
      0%, 100% { transform: translateY(0) rotate(-0.8deg); }
      50% { transform: translateY(-3px) rotate(0.8deg); }
    }
    @keyframes lulu-eye-blink {
      0%, 96%, 100% { transform: scaleY(1); }
      98% { transform: scaleY(0.1); }
    }
    @keyframes grass-wave {
      0%, 100% { transform: skewX(-2deg); }
      50% { transform: skewX(2deg); }
    }
    .lulu-anim-group { animation: lulu-natural-sway 4s ease-in-out infinite; transform-origin: bottom center; }
    .lulu-blink { animation: lulu-eye-blink 5s infinite; transform-origin: center 128px; }
    .lulu-grass { animation: grass-wave 6s ease-in-out infinite; transform-origin: bottom center; }
  `}</style>
);

const GroundBackground = () => (
  <g className="lulu-grass">
    {/* 极简地平线 */}
    <line x1="40" y1="188" x2="160" y2="188" stroke="#1A1A1A" strokeWidth="1" opacity="0.05" />
    
    {/* 像素小草 A */}
    <g transform="translate(45, 188)">
      <path d="M0 0V-4H2V0M5 0V-6H7V0" fill="#7FA68E" stroke="#1A1A1A" strokeWidth="1" />
    </g>
    
    {/* 像素小草 B */}
    <g transform="translate(148, 188)">
      <path d="M0 0V-5H2V0M4 0V-3H6V0" fill="#5D8A71" stroke="#1A1A1A" strokeWidth="1" />
    </g>
  </g>
);

const StaticShadow = () => (
  <ellipse cx="100" cy="188" rx="40" ry="8" fill="#5D3A2F" opacity="0.08" />
);

const PixelLeaves = () => (
  <g transform="translate(100, 104)">
    {/* 后叶子 */}
    <g transform="rotate(25) translate(2, -2)">
      <path 
        d="M-2 0H2V-6H5V-12H7V-20H8V-35H6V-40H2V-42H-4V-40H-7V-35H-9V-20H-7V-12H-4V-6H-2V0Z" 
        fill="#5D8A71" 
        stroke="#1A1A1A" 
        strokeWidth="3.5" 
      />
    </g>
    {/* 前叶子 */}
    <g transform="rotate(-10) translate(-1, 0)">
      <path 
        d="M-3 0H3V-6H6V-12H8V-22H9V-38H6V-44H2V-46H-4V-44H-7V-38H-9V-22H-7V-12H-5V-6H-3V0Z" 
        fill="#7FA68E" 
        stroke="#1A1A1A" 
        strokeWidth="3.5" 
      />
    </g>
  </g>
);

const PixelBody: React.FC<{ expression?: 'normal' | 'scared' | 'sleep', children?: React.ReactNode }> = ({ expression = 'normal', children }) => (
  <g className="lulu-anim-group">
    {/* 身体主轮廓 */}
    <path 
      d="
        M88 102H112V105H118V110H124V118H128V135
        L138 145V152H128V165
        L125 182H112V173H88V182H75V165
        L72 152H62V145L72 135V118H76V110H82V105H88V102Z
      " 
      fill="white" 
      stroke="#1A1A1A" 
      strokeWidth="4" 
      strokeLinejoin="miter"
    />
    
    {/* 肚皮阴影 */}
    <path d="M92 168H108V170H92V168Z" fill="#F5F5F5" />
    
    {/* 叶子固定在身体内部 */}
    <PixelLeaves />

    {/* 五官系统 */}
    {expression === 'normal' && (
      <g className="lulu-blink">
        <rect x="91" y="125" width="3.5" height="8" fill="#1A1A1A" rx="1" />
        <rect x="106" y="125" width="3.5" height="8" fill="#1A1A1A" rx="1" />
      </g>
    )}

    {expression === 'sleep' && (
      <>
        <rect x="90" y="128" width="6" height="2" fill="#1A1A1A" rx="1" />
        <rect x="104" y="128" width="6" height="2" fill="#1A1A1A" rx="1" />
      </>
    )}

    {expression === 'scared' && (
      <>
        <rect x="92" y="122" width="3" height="6" fill="#1A1A1A" />
        <rect x="105" y="122" width="3" height="6" fill="#1A1A1A" />
        <rect x="94" y="142" width="12" height="12" fill="white" stroke="#1A1A1A" strokeWidth="3" rx="2" />
      </>
    )}
    
    {children}
  </g>
);

export const LuluChef: React.FC<LuluProps> = ({ className = "", size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 200 220" fill="none" className={className}>
    <Animations />
    <GroundBackground />
    <StaticShadow />
    <PixelBody>
      <g transform="translate(136, 142)">
        <path d="M0 0H18V10H10V18H0V0Z" fill="#FF5252" stroke="#1A1A1A" strokeWidth="2.5" />
        <rect x="0" y="0" width="18" height="3" fill="#2ED573" />
      </g>
    </PixelBody>
  </svg>
);

export const LuluSleep: React.FC<LuluProps> = ({ className = "", size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 200 220" fill="none" className={className}>
    <Animations />
    <GroundBackground />
    <StaticShadow />
    <PixelBody expression="sleep" />
    <g className="animate-pulse" style={{ animationDuration: '4s' }}>
      <text x="150" y="100" fontSize="20" fontWeight="900" fill="#B45309" opacity="0.2" style={{fontFamily: 'monospace'}}>Zzz</text>
    </g>
  </svg>
);

export const LuluSearch: React.FC<LuluProps> = ({ className = "", size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 200 220" fill="none" className={className}>
    <Animations />
    <GroundBackground />
    <StaticShadow />
    <PixelBody>
       <path d="M125 140L145 120" stroke="#5D3A2F" strokeWidth="6" strokeLinecap="round" />
       <circle cx="145" cy="120" r="10" fill="white" stroke="#1A1A1A" strokeWidth="3" />
    </PixelBody>
  </svg>
);

export const LuluCart: React.FC<LuluProps> = ({ className = "", size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 200 220" fill="none" className={className}>
    <Animations />
    <GroundBackground />
    <StaticShadow />
    <PixelBody>
      {/* 已根据要求去掉原本的蓝色背带线段 */}
      <rect x="45" y="145" width="24" height="24" rx="5" fill="#A29BFE" stroke="#1A1A1A" strokeWidth="3" />
    </PixelBody>
  </svg>
);

export const LuluScared: React.FC<LuluProps> = ({ className = "", size = 100 }) => (
  <svg width={size} height={size} viewBox="0 0 200 220" fill="none" className={className}>
    <Animations />
    <StaticShadow />
    <PixelBody expression="scared" />
  </svg>
);

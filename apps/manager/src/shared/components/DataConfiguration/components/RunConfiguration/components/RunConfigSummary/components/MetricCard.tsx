import React from "react";
import CountUp from "react-countup";
import i18n from "@dhis2/d2-i18n";

interface MetricCardProps {
    title: string;
    value: number;
    color?: string;
    bgColor?: string;
    onClick?: () => void;
}

export function MetricCard({ 
    title, 
    value, 
    color = 'var(--colors-blue700)',
    bgColor = 'var(--colors-blue050)',
    onClick 
}: MetricCardProps) {
    return (
        <div 
            onClick={onClick}
            style={{
                padding: '16px',
                border: `2px solid ${color}`,
                borderRadius: '12px',
                background: bgColor,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                minWidth: '140px'
            }}
            onMouseEnter={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                }
            }}
            onMouseLeave={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <div style={{ 
                    fontSize: '14px', 
                    color: 'var(--colors-grey700)', 
                    fontWeight: '500',
                    textTransform: 'uppercase'
                }}>
                    {title}
                </div>
                <CountUp 
                    end={value} 
                    duration={1.5} 
                    style={{ 
                        fontSize: '32px', 
                        fontWeight: '700',
                        color: color
                    }} 
                />
                {onClick && (
                    <div style={{
                        fontSize: '10px',
                        color: 'var(--colors-grey600)',
                        fontStyle: 'italic'
                    }}>
                        {i18n.t('Click for details')}
                    </div>
                )}
            </div>
        </div>
    );
}
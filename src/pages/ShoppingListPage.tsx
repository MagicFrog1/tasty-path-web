import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiDownloadCloud, FiFilter, FiRefreshCw, FiShoppingCart, FiTag, FiCalendar, FiLock } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { useShoppingList } from '../context/ShoppingListContext';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { useSubscription } from '../context/SubscriptionContext';
import { theme } from '../styles/theme';
import PremiumBlock from '../components/PremiumBlock';

const PageWrapper = styled.div`
  display: grid;
  gap: 28px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  h1 {
    margin: 0;
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: 800;
    color: #0a0e13;
    font-family: ${theme.fonts.heading};
    letter-spacing: -0.03em;
    line-height: 1.2;
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    line-height: 1.7;
  }
`;

const SummaryBar = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const SummaryCard = styled.div`
  display: grid;
  gap: 6px;
  padding: 18px 22px;
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(236, 253, 245, 0.92));
  border: 1px solid rgba(46, 139, 87, 0.16);
  box-shadow: 0 18px 42px rgba(46, 139, 87, 0.15);

  span {
    font-size: 13px;
    color: rgba(46, 139, 87, 0.8);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  strong {
    font-size: 1.4rem;
    color: ${theme.colors.primaryDark};
  }
`;

const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 16px;
  border: 1px solid rgba(46, 139, 87, 0.2);
  background: rgba(255, 255, 255, 0.95);
  font-weight: 600;
  color: ${theme.colors.primaryDark};
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  svg {
    font-size: 18px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 40px rgba(46, 139, 87, 0.18);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const EmptyStateButton = styled(Button)`
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  color: #fff;
  border: none;
`;

const PrimaryButton = styled(Button)`
  border: none;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  color: #fff;
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  color: ${theme.colors.textSecondary};
`;

const PlanSelect = styled.select`
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(46, 139, 87, 0.25);
  background: rgba(255, 255, 255, 0.94);
  color: ${theme.colors.textPrimary};
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(46, 139, 87, 0.12);
`;

const CategoryColumn = styled.div`
  display: grid;
  gap: 14px;
`;

const CategoryCard = styled.div`
  display: grid;
  gap: 16px;
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(46, 139, 87, 0.16);
  box-shadow: 0 18px 45px rgba(46, 139, 87, 0.12);
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: ${theme.colors.primaryDark};

  h3 {
    margin: 0;
    font-size: 1.1rem;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  span {
    font-size: 0.9rem;
    color: ${theme.colors.textSecondary};
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const ItemCard = styled.label<{ checked: boolean }>`
  display: grid;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 2px solid ${({ checked }) => (checked ? 'rgba(46, 139, 87, 0.6)' : 'rgba(46, 139, 87, 0.18)')};
  background: ${({ checked }) => (checked ? 'rgba(236, 253, 245, 0.98)' : 'rgba(255, 255, 255, 0.96)')};
  box-shadow: ${({ checked }) => (checked ? '0 18px 40px rgba(46, 139, 87, 0.25)' : '0 16px 32px rgba(46, 139, 87, 0.12)')};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-3px);
  }

  &::before {
    content: ${({ checked }) => (checked ? '"✓"' : '""')};
    position: absolute;
    top: 12px;
    right: 16px;
    width: 24px;
    height: 24px;
    background: ${({ checked }) => (checked ? 'rgba(46, 139, 87, 0.95)' : 'transparent')};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  input {
    display: none;
  }
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ItemInfo = styled.div<{ checked: boolean }>`
  display: grid;
  gap: 4px;

  strong {
    font-size: 1rem;
    color: ${({ checked }) => (checked ? 'rgba(46, 139, 87, 0.7)' : theme.colors.textPrimary)};
    text-decoration: ${({ checked }) => (checked ? 'line-through' : 'none')};
    opacity: ${({ checked }) => (checked ? 0.6 : 1)};
    transition: all 0.2s ease;
  }

  span {
    font-size: 12px;
    color: ${({ checked }) => (checked ? 'rgba(46, 139, 87, 0.6)' : theme.colors.textSecondary)};
    text-decoration: ${({ checked }) => (checked ? 'line-through' : 'none')};
    opacity: ${({ checked }) => (checked ? 0.6 : 1)};
  }
`;

const ItemAmount = styled.div<{ checked: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ checked }) => (checked ? 'rgba(46, 139, 87, 0.7)' : theme.colors.primaryDark)};
  text-decoration: ${({ checked }) => (checked ? 'line-through' : 'none')};
  opacity: ${({ checked }) => (checked ? 0.6 : 1)};
  transition: all 0.2s ease;
`;

const PriceTag = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${theme.colors.primaryDark};
`;
const ItemNotes = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const PremiumLock = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: ${theme.colors.white};
  border-radius: 24px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(46, 139, 87, 0.1);
  
  svg {
    font-size: 64px;
    color: ${theme.colors.primary};
    margin-bottom: 24px;
  }
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 24px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
  }
  
  p {
    margin: 0 0 24px 0;
    color: ${theme.colors.textSecondary};
    line-height: 1.6;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
  
  button {
    padding: 14px 28px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
    color: white;
    font-weight: 600;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(46, 139, 87, 0.3);
    }
  }
`;

const PremiumBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(34, 197, 94, 0.08) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.3);
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 16px;
`;

const EmptyState = styled.div`
  padding: 60px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px dashed rgba(46, 139, 87, 0.25);
  text-align: center;
  color: ${theme.colors.textSecondary};
  box-shadow: 0 18px 40px rgba(46, 139, 87, 0.12);

  h3 {
    margin-top: 0;
    color: ${theme.colors.primaryDark};
  }
`;

const ShoppingListPage: React.FC = () => {
  const { shoppingList, toggleItemChecked, clearCheckedItems } = useShoppingList();
  const { weeklyPlans } = useWeeklyPlan();
  const { currentPlan } = useSubscription();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('todos');

  // Verificar si el usuario tiene plan premium
  const isPremium = currentPlan && currentPlan.plan !== 'free' && currentPlan.isActive;

  // Si no es premium, mostrar bloque de upgrade
  if (!isPremium) {
    return (
      <PremiumBlock
        title="Lista de Compras requiere Premium"
        message="Desbloquea acceso a listas de compras inteligentes y automáticas con una suscripción Premium."
        featureName="Lista de Compras"
      />
    );
  }

  // Obtener el presupuesto del plan seleccionado
  const planBudget = useMemo(() => {
    if (selectedPlan === 'todos' && shoppingList.length > 0) {
      const firstPlanId = shoppingList[0]?.sourcePlan;
      if (firstPlanId) {
        const plan = weeklyPlans.find(p => p.id === firstPlanId);
        return plan?.config?.weeklyBudget || null;
      }
    } else if (selectedPlan !== 'todos') {
      const plan = weeklyPlans.find(p => p.id === selectedPlan);
      return plan?.config?.weeklyBudget || null;
    }
    return null;
  }, [selectedPlan, shoppingList, weeklyPlans]);

  const filteredItems = useMemo(() => {
    let items = shoppingList.filter(item => (selectedPlan === 'todos' ? true : item.sourcePlan === selectedPlan));
    
    // Si hay un presupuesto, ajustar los precios proporcionalmente
    if (planBudget && items.length > 0) {
      const totalCost = items.reduce((sum, item) => sum + (item.price || 0), 0);
      if (totalCost > planBudget) {
        const adjustmentFactor = planBudget / totalCost;
        items = items.map(item => ({
          ...item,
          price: (item.price || 0) * adjustmentFactor
        }));
      }
    }
    
    return items;
  }, [shoppingList, selectedPlan, planBudget]);

  // Orden lógico de supermercado (no alfabético)
  const categoryOrder = [
    'Carnes y Aves',
    'Pescados y Mariscos',
    'Lácteos y Huevos',
    'Frutas',
    'Verduras',
    'Granos y Cereales',
    'Legumbres',
    'Frutos Secos y Semillas',
    'Aceites y Grasas',
    'Condimentos y Especias',
    'Otros'
  ];

  // Agrupar por plan y luego por categoría
  const groupedByPlan = useMemo(() => {
    if (selectedPlan !== 'todos') {
      // Si hay un plan seleccionado, agrupar solo por categoría
      const grouped = filteredItems.reduce<Record<string, typeof shoppingList>>((acc, item) => {
        const category = item.category || 'Otros';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {});

      return [{
        planId: selectedPlan,
        planName: weeklyPlans.find(p => p.id === selectedPlan)?.name || 'Plan seleccionado',
        weekRange: filteredItems[0]?.weekRange,
        categories: Object.entries(grouped).sort(([a], [b]) => {
          const indexA = categoryOrder.indexOf(a);
          const indexB = categoryOrder.indexOf(b);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.localeCompare(b, 'es');
        })
      }];
    }

    // Si es "todos", agrupar primero por plan
    const byPlan = filteredItems.reduce<Record<string, typeof shoppingList>>((acc, item) => {
      const planId = item.sourcePlan || 'sin-plan';
      if (!acc[planId]) acc[planId] = [];
      acc[planId].push(item);
      return acc;
    }, {});

    return Object.entries(byPlan).map(([planId, items]) => {
      const plan = weeklyPlans.find(p => p.id === planId);
      const grouped = items.reduce<Record<string, typeof shoppingList>>((acc, item) => {
        const category = item.category || 'Otros';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {});

      return {
        planId,
        planName: plan?.name || items[0]?.planName || 'Plan sin nombre',
        weekRange: items[0]?.weekRange,
        categories: Object.entries(grouped).sort(([a], [b]) => {
          const indexA = categoryOrder.indexOf(a);
          const indexB = categoryOrder.indexOf(b);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.localeCompare(b, 'es');
        })
      };
    });
  }, [filteredItems, selectedPlan, weeklyPlans]);

  const planOptions = useMemo(() => {
    const options = weeklyPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
    }));
    return [{ id: 'todos', name: 'Todos mis planes' }, ...options];
  }, [weeklyPlans]);

  const stats = useMemo(() => {
    const checkedItems = filteredItems.filter(item => item.isChecked);
    const pendingItems = filteredItems.filter(item => !item.isChecked);
    
    // Calcular costo total sin ajuste
    const rawTotalCost = pendingItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const rawTotalCostAll = filteredItems.reduce((sum, item) => sum + (item.price || 0), 0);
    
    // Obtener el presupuesto del plan si hay un plan seleccionado
    let budgetLimit: number | null = null;
    if (selectedPlan !== 'todos' && filteredItems.length > 0) {
      const plan = weeklyPlans.find(p => p.id === selectedPlan);
      if (plan?.config?.weeklyBudget) {
        budgetLimit = plan.config.weeklyBudget;
      }
    } else if (selectedPlan === 'todos' && filteredItems.length > 0) {
      // Si hay múltiples planes, usar el presupuesto del primer plan encontrado
      const firstPlanId = filteredItems[0]?.sourcePlan;
      if (firstPlanId) {
        const plan = weeklyPlans.find(p => p.id === firstPlanId);
        if (plan?.config?.weeklyBudget) {
          budgetLimit = plan.config.weeklyBudget;
        }
      }
    }
    
    // Si hay un presupuesto y el costo lo excede, ajustar proporcionalmente
    let adjustedTotalCost = rawTotalCost;
    if (budgetLimit && rawTotalCost > budgetLimit) {
      adjustedTotalCost = budgetLimit;
    }
    
    let adjustedTotalCostAll = rawTotalCostAll;
    if (budgetLimit && rawTotalCostAll > budgetLimit) {
      adjustedTotalCostAll = budgetLimit;
    }
    
    return {
      totalItems: filteredItems.length,
      checked: checkedItems.length,
      pending: pendingItems.length,
      totalCost: adjustedTotalCost,
      totalCostAll: adjustedTotalCostAll,
      budgetLimit,
    };
  }, [filteredItems, selectedPlan, weeklyPlans]);

  const handleExportPdf = () => {
    if (filteredItems.length === 0) return;

    const doc = new jsPDF();
    const marginX = 16;
    const lineHeight = 7;
    let cursorY = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Lista de Compras MyTastyPath', marginX, cursorY);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    cursorY += lineHeight;
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, marginX, cursorY);

    cursorY += lineHeight * 1.5;

    categories.forEach(([category, items]) => {
      if (cursorY > 270) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(category.toUpperCase(), marginX, cursorY);
      cursorY += lineHeight;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);

      items.forEach(item => {
        if (cursorY > 280) {
          doc.addPage();
          cursorY = 20;
        }
        const bullet = `• ${item.name} — ${item.amount} ${item.unit}`;
        // Filtrar notes que contengan información del plan
        const notes = item.notes && !item.notes.includes('Plan:') ? item.notes : null;
        const text = notes ? `${bullet} (${notes})` : bullet;
        const textWidth = doc.internal.pageSize.getWidth() - marginX * 2;
        const lines = doc.splitTextToSize(text, textWidth);
        
        // Si el item está marcado, dibujarlo tachado
        if (item.isChecked) {
          doc.setTextColor(128, 128, 128); // Color gris para items marcados
          lines.forEach((line, lineIndex) => {
            const lineY = cursorY;
            doc.text(line, marginX + 4, lineY);
            // Dibujar línea tachada sobre el texto
            const textWidthPx = doc.getTextWidth(line);
            doc.setDrawColor(128, 128, 128);
            doc.setLineWidth(0.5);
            doc.line(marginX + 4, lineY - 2, marginX + 4 + textWidthPx, lineY - 2);
            cursorY += lineHeight;
            if (cursorY > 280) {
              doc.addPage();
              cursorY = 20;
            }
          });
          doc.setTextColor(0, 0, 0); // Restaurar color negro
        } else {
          doc.setTextColor(0, 0, 0); // Color negro para items no marcados
        lines.forEach(line => {
          doc.text(line, marginX + 4, cursorY);
          cursorY += lineHeight;
          if (cursorY > 280) {
            doc.addPage();
            cursorY = 20;
          }
        });
        }
        cursorY += 2;
      });

      cursorY += lineHeight / 2;
    });

    doc.save('lista-compras-mytastypath.pdf');
  };

  const handleClearSelected = () => {
    if (filteredItems.some(item => item.isChecked)) {
      clearCheckedItems();
    }
  };

  return (
    <PageWrapper>
      <Header>
        <h1>Lista de Compras</h1>
        <p>Consulta los ingredientes organizados por categoría y marca los que ya tengas. Descarga la lista en PDF para llevarla contigo.</p>
        {isPremium && (
          <PremiumBadge>
            <FiLock />
            Función Premium Activa
          </PremiumBadge>
        )}
      </Header>

      <SummaryBar>
        <SummaryCard>
          <span>Total de ingredientes</span>
          <strong>{stats.totalItems}</strong>
        </SummaryCard>
        <SummaryCard>
          <span>Listos</span>
          <strong>{stats.checked}</strong>
        </SummaryCard>
        <SummaryCard>
          <span>Pendientes</span>
          <strong>{stats.pending}</strong>
        </SummaryCard>
        <SummaryCard>
          <span>Costo estimado</span>
          <strong>{stats.totalCost.toFixed(2)} €</strong>
          {stats.checked > 0 && (
            <span style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
              Ahorro: {(stats.totalCostAll - stats.totalCost).toFixed(2)} €
            </span>
          )}
        </SummaryCard>
      </SummaryBar>

      <ActionsRow>
        <Filters>
          <FiFilter />
          <span>Filtrar por plan:</span>
          <PlanSelect value={selectedPlan} onChange={event => setSelectedPlan(event.target.value)}>
            {planOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </PlanSelect>
        </Filters>

        <ActionButtons>
          <Button onClick={handleClearSelected}>
            <FiRefreshCw />
            Limpiar seleccionados
          </Button>
          <PrimaryButton onClick={handleExportPdf} disabled={filteredItems.length === 0}>
            <FiDownloadCloud />
            Descargar PDF
          </PrimaryButton>
        </ActionButtons>
      </ActionsRow>

      {groupedByPlan.length === 0 ? (
        <EmptyState>
          <h3>No hay ingredientes por ahora</h3>
          <p>Genera un plan semanal para recibir automáticamente tu lista organizada de compras.</p>
        </EmptyState>
      ) : (
        <CategoryColumn>
          {groupedByPlan.map((planGroup) => (
            <div key={planGroup.planId} style={{ marginBottom: '32px' }}>
              {selectedPlan === 'todos' && (
                <div style={{
                  marginBottom: '20px',
                  padding: '16px 20px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(46, 139, 87, 0.1), rgba(46, 139, 87, 0.05))',
                  border: '2px solid rgba(46, 139, 87, 0.2)',
                  boxShadow: '0 8px 24px rgba(46, 139, 87, 0.15)'
                }}>
                  <h2 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: theme.colors.primaryDark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <FiCalendar />
                    {planGroup.planName}
                  </h2>
                  {planGroup.weekRange && (
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: theme.colors.textSecondary,
                      fontWeight: 500
                    }}>
                      {planGroup.weekRange}
                    </p>
                  )}
                </div>
              )}
              {planGroup.categories.map(([category, items]) => (
                <CategoryCard key={`${planGroup.planId}-${category}`}>
                  <CategoryHeader>
                    <h3>
                      <FiTag />
                      {category}
                    </h3>
                    <span>{items.length} {items.length === 1 ? 'ingrediente' : 'ingredientes'}</span>
                  </CategoryHeader>

                  <ItemsGrid>
                    {items.map(item => (
                      <ItemCard key={item.id} checked={item.isChecked}>
                        <input
                          type="checkbox"
                          checked={item.isChecked}
                          onChange={() => toggleItemChecked(item.id)}
                        />
                        <ItemRow>
                          <ItemInfo checked={item.isChecked}>
                            <strong>{item.name}</strong>
                            <span>{item.category}</span>
                          </ItemInfo>
                          <ItemAmount checked={item.isChecked}>
                            <FiShoppingCart style={{ marginRight: 6 }} />
                            {item.amount} {item.unit}
                            {item.price > 0 && <PriceTag>· {item.price.toFixed(2)} €</PriceTag>}
                          </ItemAmount>
                        </ItemRow>
                        {item.notes && <ItemNotes>{item.notes}</ItemNotes>}
                      </ItemCard>
                    ))}
                  </ItemsGrid>
                </CategoryCard>
              ))}
            </div>
          ))}
        </CategoryColumn>
      )}
    </PageWrapper>
  );
};

export default ShoppingListPage;

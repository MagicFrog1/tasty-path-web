import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiDownloadCloud, FiFilter, FiRefreshCw, FiShoppingCart, FiTag } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { useShoppingList } from '../context/ShoppingListContext';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { theme } from '../styles/theme';

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
    font-size: clamp(2.2rem, 4vw, 2.6rem);
    color: ${theme.colors.textPrimary};
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
  border: 1px solid ${({ checked }) => (checked ? 'rgba(46, 139, 87, 0.38)' : 'rgba(46, 139, 87, 0.18)')};
  background: ${({ checked }) => (checked ? 'rgba(236, 253, 245, 0.95)' : 'rgba(255, 255, 255, 0.96)')};
  box-shadow: ${({ checked }) => (checked ? '0 18px 40px rgba(46, 139, 87, 0.18)' : '0 16px 32px rgba(46, 139, 87, 0.12)')};
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
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

const ItemInfo = styled.div`
  display: grid;
  gap: 4px;

  strong {
    font-size: 1rem;
    color: ${theme.colors.textPrimary};
  }

  span {
    font-size: 12px;
    color: ${theme.colors.textSecondary};
  }
`;

const ItemAmount = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${theme.colors.primaryDark};
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
  const [selectedPlan, setSelectedPlan] = useState<string>('todos');

  const filteredItems = useMemo(
    () =>
      shoppingList.filter(item => (selectedPlan === 'todos' ? true : item.sourcePlan === selectedPlan)),
    [shoppingList, selectedPlan]
  );

  const categories = useMemo(() => {
    const grouped = filteredItems.reduce<Record<string, typeof shoppingList>>((acc, item) => {
      const category = item.category || 'Otros';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, 'es'));
  }, [filteredItems, shoppingList]);

  const planOptions = useMemo(() => {
    const options = weeklyPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
    }));
    return [{ id: 'todos', name: 'Todos mis planes' }, ...options];
  }, [weeklyPlans]);

  const stats = useMemo(() => {
    const checkedItems = filteredItems.filter(item => item.isChecked);
    return {
      totalItems: filteredItems.length,
      checked: checkedItems.length,
      pending: filteredItems.length - checkedItems.length,
      totalCost: filteredItems.reduce((sum, item) => sum + (item.price || 0), 0),
    };
  }, [filteredItems]);

  const handleExportPdf = () => {
    if (filteredItems.length === 0) return;

    const doc = new jsPDF();
    const marginX = 16;
    const lineHeight = 7;
    let cursorY = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Lista de Compras TastyPath', marginX, cursorY);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    cursorY += lineHeight;
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, marginX, cursorY);
    if (selectedPlan !== 'todos') {
      const selectedPlanName = weeklyPlans.find(plan => plan.id === selectedPlan)?.name || 'Plan seleccionado';
      cursorY += lineHeight;
      doc.text(`Plan: ${selectedPlanName}`, marginX, cursorY);
    }

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
        const text = item.notes ? `${bullet} (${item.notes})` : bullet;
        const textWidth = doc.internal.pageSize.getWidth() - marginX * 2;
        const lines = doc.splitTextToSize(text, textWidth);
        lines.forEach(line => {
          doc.text(line, marginX + 4, cursorY);
          cursorY += lineHeight;
          if (cursorY > 280) {
            doc.addPage();
            cursorY = 20;
          }
        });
        cursorY += 2;
      });

      cursorY += lineHeight / 2;
    });

    doc.save('lista-compras-tastypath.pdf');
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

      {categories.length === 0 ? (
        <EmptyState>
          <h3>No hay ingredientes por ahora</h3>
          <p>Genera un plan semanal para recibir automáticamente tu lista organizada de compras.</p>
        </EmptyState>
      ) : (
        <CategoryColumn>
          {categories.map(([category, items]) => (
            <CategoryCard key={category}>
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
                      <ItemInfo>
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                      </ItemInfo>
                      <ItemAmount>
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
        </CategoryColumn>
      )}
    </PageWrapper>
  );
};

export default ShoppingListPage;

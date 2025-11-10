import React from 'react';
import styled from 'styled-components';
import { useShoppingList } from '../context/ShoppingListContext';
import { theme } from '../styles/theme';

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
`;

const Item = styled.li`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid ${theme.colors.gray};
  border-radius: 12px;
  background: ${theme.colors.white};
`;

const ShoppingListPage: React.FC = () => {
  const { shoppingList, toggleItemChecked, clearCheckedItems } = useShoppingList();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Lista de Compras</h1>
      <div style={{ marginBottom: 16 }}>
        <button onClick={clearCheckedItems}>Eliminar seleccionados</button>
      </div>
      <List>
        {shoppingList.map(item => (
          <Item key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <div style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.category}</div>
            </div>
            <div style={{ color: theme.colors.textSecondary }}>
              {item.amount} {item.unit}
            </div>
            <div>
              <input
                type="checkbox"
                checked={item.isChecked}
                onChange={() => toggleItemChecked(item.id)}
              />
            </div>
          </Item>
        ))}
      </List>
    </div>
  );
};

export default ShoppingListPage;



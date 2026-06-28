export type RootStackParamList = {
  Home: undefined;
  AddExpense: {expenseId?: string} | undefined;
  ExpenseDetail: {expenseId: string};
};

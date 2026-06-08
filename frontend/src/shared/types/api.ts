export type ApiResponse<TData, TMeta = never> = {
   data: TData
   meta?: TMeta
}